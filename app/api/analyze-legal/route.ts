import { NextRequest, NextResponse } from 'next/server';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, region, languageNote } = body;

  if (!question || !region) {
    return NextResponse.json({ error: 'Missing question or region' }, { status: 400 });
  }

  const client = ModelClient(
    'https://models.github.ai/inference',
    new AzureKeyCredential(process.env.GITHUB_TOKEN || "")
  );

  const prompt = `You are a legal assistant helping condo owners with region-specific guidance.\n\nRegion: ${region}\nQuestion: ${question}\n\nProvide a clear, structured answer for a layperson. ${languageNote}`;

  const result = await client.path('/chat/completions').post({
    body: {
      model: 'openai/gpt-4o',
      messages: [
        { role: "system", content: `You are a helpful legal assistant. ${languageNote}` },
        { role: "user", content: prompt },
      ],
    },
  });

  if (isUnexpected(result)) {
    return NextResponse.json({ error: result.body?.error?.message || "Unexpected error" }, { status: 500 });
  }

  return NextResponse.json({ answer: result.body.choices[0].message.content });
}
