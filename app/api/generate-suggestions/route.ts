import { NextRequest, NextResponse } from 'next/server';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const MAX_ITEMS_PER_CHUNK = 8;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function callSuggestionModel(client: any, model: string, items: any[]) {
  const prompt = `You're a condo cost consultant. Review these charges and suggest actionable cost-saving ideas for the owner. Return a JSON array where each item has:
- "suggestion" (string) describing the cost-saving idea,
- "category" (string) categorizing the suggestion,
- "estimated_savings" (number) estimating potential savings in dollars.

Example:
[
  {
    "suggestion": "Negotiate landscaping contract to reduce monthly fee.",
    "category": "Contract Negotiation",
    "estimated_savings": 5000
  },
  ...
]

Here is the data to analyze:\n\n${JSON.stringify(items, null, 2)}`;

  const result = await client.path('/chat/completions').post({
    body: {
      model,
      messages: [
        { role: 'system', content: 'You provide precise, practical cost-saving suggestions in JSON format.' },
        { role: 'user', content: prompt },
      ],
    },
  });

  if (isUnexpected(result)) throw new Error(result.body?.error?.message || 'Model failure');

  return result.body.choices[0].message.content;
}

// Helper to safely parse JSON from model output
function tryParseJSON(raw: string): any | null {
  try {
    // Find first '{' or '[' to start JSON parsing
    const firstBrace = Math.min(
      ...['{', '[']
        .map(ch => raw.indexOf(ch))
        .filter(i => i !== -1)
    );
    if (firstBrace === Infinity) return null;

    // Try to find matching closing brace
    const lastBrace = raw.lastIndexOf('}') > raw.lastIndexOf(']') ? raw.lastIndexOf('}') : raw.lastIndexOf(']');
    if (lastBrace === -1) return null;

    // Extract the slice that looks like JSON
    const jsonSlice = raw.slice(firstBrace, lastBrace + 1);

    // Try parse once
    return JSON.parse(jsonSlice);
  } catch {
    // If parsing fails, try minor fixes: remove trailing commas etc.

    // Simple fix: remove trailing commas before } or ]
    const cleaned = raw
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/\n/g, '');            // Optional: remove newlines if breaking parse

    try {
      const firstBrace = Math.min(
        ...['{', '[']
          .map(ch => cleaned.indexOf(ch))
          .filter(i => i !== -1)
      );
      if (firstBrace === Infinity) return null;

      const lastBrace = cleaned.lastIndexOf('}') > cleaned.lastIndexOf(']') ? cleaned.lastIndexOf('}') : cleaned.lastIndexOf(']');
      if (lastBrace === -1) return null;

      const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);

      return JSON.parse(jsonSlice);
    } catch (e) {
      console.warn("Failed to parse JSON after cleanup:", e);
      return null;
    }
  }
}


export async function POST(request: NextRequest) {
  try {
    const { breakdown } = await request.json();

    if (!Array.isArray(breakdown) || breakdown.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid breakdown' }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: 'Missing GitHub Token' }, { status: 500 });

    const client = ModelClient('https://models.github.ai/inference', new AzureKeyCredential(token));

    const models = [
      'openai/gpt-4o',
      'openai/gpt-4.1',
      'meta/Llama-3.2-11B-Vision-Instruct',
    ];

    const chunks = chunkArray(breakdown, MAX_ITEMS_PER_CHUNK);

    const responses = await Promise.allSettled(
      chunks.map((chunk, i) => callSuggestionModel(client, models[i % models.length], chunk))
    );

    // Merge all parsed suggestions into a single array
    const mergedSuggestions: {
      suggestion: string;
      category: string;
      estimated_savings: number;
    }[] = [];

   for (const res of responses) {
  if (res.status === 'fulfilled') {
    const raw = res.value || '';
    const parsed = tryParseJSON(raw);
    if (parsed && parsed.length > 0) {
      for (const item of parsed) {
        if (
          item.suggestion &&
          typeof item.suggestion === 'string' &&
          item.category &&
          typeof item.category === 'string' &&
          typeof item.estimated_savings === 'number'
        ) {
          mergedSuggestions.push(item);
        }
      }
    } else {
      mergedSuggestions.push({
        suggestion: 'Failed to parse suggestions JSON',
        category: 'Error',
        estimated_savings: 0,
      });
    }
  } else {
    console.error('Model call failed:', res.reason);
  }
}

    // Return the array of structured suggestions
    return NextResponse.json({ suggestions: mergedSuggestions });
  } catch (err: any) {
    console.error('Suggestion error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
