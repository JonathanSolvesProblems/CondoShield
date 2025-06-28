import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import os from 'os';
import fs from 'fs';
import path from 'path';

const MAX_CHUNK_LENGTH = 8000;

function chunkText(text: string, maxLength = MAX_CHUNK_LENGTH): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

function tryParseJSON(raw: string): any[] | null {
  try {
    const firstBrace = raw.indexOf('[');
    const lastBrace = raw.lastIndexOf(']');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const sliced = raw.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(sliced);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed loose JSON parse:', e);
  }
  return null;
}

async function callModel(client: any, model: string, chunk: string, languageNote) {
  console.log('Sending chunk to model:\n', chunk);
  const result = await client.path('/chat/completions').post({
    body: {
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert assistant for reviewing condo association fee documents. ${languageNote}`,
        },
        {
          role: 'user',
          content: `Here is part of a condo fee document:\n\n${chunk}\n\nExtract any financial charges or billed items. Return ONLY a valid JSON array of objects with these fields:\n- category (string)\n- description (string)\n- amount (number)\n- questionable (boolean — true if the item may need review)\n\nIf nothing is found, return an empty array. No extra commentary. ${languageNote}`,
        },
      ],
    },
  });

  if (isUnexpected(result)) {
    throw new Error(result.body?.error?.message || 'Unknown model error');
  }

  return result.body.choices[0].message.content;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const languageNote = formData.get('languageNote')?.toString() ?? '';
    const ocrLang = languageNote.toLowerCase().includes('french') ? 'fra' : 'eng';

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Missing GitHub Token' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfMeta = await pdf(buffer);
    let text = pdfMeta.text;

    if (!text || text.trim().length < 20) {
      console.log('Falling back to OCR...');
      const pages = pdfMeta.numpages || 3;
      text = await extractTextWithOCR(buffer, ocrLang, pages);
      console.log("Total OCR text length:", text.length);
console.log("OCR snippet:", JSON.stringify(text.slice(0, 500)));

    }

    console.log('Final extracted text length:', text.length);
    console.log('First 500 chars of extracted text:\n', text.slice(0, 500));

    const textChunks = chunkText(text).filter(chunk => chunk.trim().length > 10);

    if (textChunks.length === 0) {
      return NextResponse.json({
        error: 'Still no usable text after OCR. Please ensure the document is clear and legible.',
      }, { status: 422 });
    }

    const client = ModelClient(
      'https://models.github.ai/inference',
      new AzureKeyCredential(token)
    );

    const models = ['openai/gpt-4o', 'openai/gpt-4.1', 'meta/Llama-3.2-11B-Vision-Instruct'];

    const responses = await Promise.allSettled(
      textChunks.map((chunk, idx) =>
        callModel(client, models[idx % models.length], chunk, languageNote)
      )
    );

    const merged: any[] = [];

    for (const res of responses) {
      if (res.status === 'fulfilled') {
        const rawOutput = res.value;
        console.log('MODEL RAW OUTPUT:\n', rawOutput);
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
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

async function extractTextWithOCR(buffer: Buffer, lang = 'eng', totalPages = 3): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}.pdf`);
  fs.writeFileSync(tmpPath, buffer);

  const converter = fromPath(tmpPath, {
    density: 200,
    saveFilename: 'ocr-page',
    savePath: os.tmpdir(),
    format: 'png',
    width: 1200,
    height: 1600,
  });

  let ocrText = '';
  for (let page = 1; page <= totalPages; page++) {
    try {
      const imageInfo = await converter(page);
      const imagePath = imageInfo.path;
      if (typeof imagePath !== 'string') {
        console.warn('Invalid image path from pdf2pic');
        continue;
      }
      console.log(`OCR start for page ${page}`);

      const result = await Tesseract.recognize(imagePath, lang);
      console.log(`OCR output page ${page} (first 200 chars):`, result.data.text.slice(0, 200));

      ocrText += result.data.text + '\n';
    } catch (e) {
      console.warn('OCR failed on page', page, e);
    }
  }

  return ocrText;
}
