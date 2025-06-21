import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const MAX_CHUNK_LENGTH = 8000;

// Split large text into manageable chunks
function chunkText(text: string, maxLength = MAX_CHUNK_LENGTH): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

// Attempt to extract a valid JSON block even from noisy output
function tryParseJSON(raw: string): any[] | null {
  try {
    const firstBrace = raw.indexOf('[');
    const lastBrace = raw.lastIndexOf(']');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const sliced = raw.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(sliced);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed loose JSON parse:", e);
  }
  return null;
}

// Call a model with specific prompt and chunk
async function callModel(client: any, model: string, chunk: string) {
  console.log("Sending chunk to model:\n", chunk); // Log input

  const result = await client.path('/chat/completions').post({
    body: {
      model,
      messages: [
        {
          role: 'system',
          content: "You are an expert assistant for reviewing condo association fee documents.",
        },
        {
          role: 'user',
          content: `Here is part of a condo fee document:\n\n${chunk}\n\nExtract any financial charges or billed items. Return ONLY a valid JSON array of objects with these fields:\n- category (string)\n- description (string)\n- amount (number)\n- questionable (boolean — true if the item may need review)\n\nIf nothing is found, return an empty array. No extra commentary.`,
        },
      ],
    },
  });

  if (isUnexpected(result)) {
    throw new Error(result.body?.error?.message || 'Unknown model error');
  }

  return result.body.choices[0].message.content;
}

// API route handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Missing GitHub Token' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);

    console.log("Extracted PDF text length:", pdfData.text.length);
    console.log("First 500 chars of PDF text:\n", pdfData.text.slice(0, 500));

    let textChunks = chunkText(pdfData.text).filter(chunk => chunk.trim().length > 10);

    if (textChunks.length === 0) {
      return NextResponse.json({
        error: "No usable text extracted from PDF. It may be scanned, image-based, or empty.",
      }, { status: 422 });
    }

    const client = ModelClient(
      'https://models.github.ai/inference',
      new AzureKeyCredential(token)
    );

    const models = [
      'openai/gpt-4o',
      'openai/gpt-4.1',
      'meta/Llama-3.2-11B-Vision-Instruct',
    ];

    const responses = await Promise.allSettled(
      textChunks.map((chunk, idx) =>
        callModel(client, models[idx % models.length], chunk)
      )
    );

    const merged: any[] = [];

    for (const res of responses) {
      if (res.status === 'fulfilled') {
        const rawOutput = res.value;
        console.log("MODEL RAW OUTPUT:\n", rawOutput);

        const parsed = tryParseJSON(rawOutput);

        if (parsed && parsed.length > 0) {
          merged.push(...parsed);
        } else {
          merged.push({
            questionable: true,
            category: 'Unknown',
            description: 'No structured data found in this chunk',
            amount: 0,
            rawOutput,
          });
        }
      } else {
        merged.push({
          questionable: true,
          category: 'Error',
          description: 'Model call failed',
          amount: 0,
          error: res.reason?.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json(merged);
  } catch (err: any) {
    console.error('AI analysis error:', err);
    return NextResponse.json(
      { error: 'Server error', details: err.message },
      { status: 500 }
    );
  }
}
