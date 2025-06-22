import { NextRequest, NextResponse } from 'next/server';
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

export async function POST(req: NextRequest) {
  const { context } = await req.json();

  if (!context) {
    return NextResponse.json({ error: 'Missing context' }, { status: 400 });
  }

  const client = ModelClient(
    'https://models.github.ai/inference',
    new AzureKeyCredential(process.env.GITHUB_TOKEN || "")
  );

  const result = await client.path('/chat/completions').post({
    body: {
      model: 'openai/gpt-4o',
      messages: [
        {
          role: "system",
          content: "You are a helpful legal assistant who drafts formal letters.",
        },
        {
          role: "user",
          content: `Based on the following context, generate a formal dispute letter. Use {{placeholders}} for user-provided details like dates, names, amounts, or unit numbers. Do not include sections for sender or recipient addresses or contact information at the top of the letter. Return only the letter content, no extra commentary.\n\n${context}`,
        },
      ],
    },
  });

  if (isUnexpected(result)) {
    return NextResponse.json({ error: result.body?.error?.message || "Unexpected error" }, { status: 500 });
  }

  return NextResponse.json({ letter: result.body.choices[0].message.content });
}
