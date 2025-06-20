import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const pdfText = pdfData.text;

    // Check if GitHub token is available
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      // Return mock data if no token is available
      const mockResults = [
        {
          category: "Pool Renovation",
          amount: 850,
          description: "Pool resurfacing and equipment upgrade",
          questionable: false,
        },
        {
          category: "Legal Fees",
          amount: 300,
          description: "Attorney consultation fees",
          questionable: true,
        },
        {
          category: "Administrative Fee",
          amount: 75,
          description: "Processing and handling charges",
          questionable: true,
        },
        {
          category: "Emergency Repairs",
          amount: 200,
          description: "Plumbing emergency repair",
          questionable: false,
        },
        {
          category: "Late Fee",
          amount: 50,
          description: "Late payment penalty",
          questionable: true,
        },
      ];
      
      return NextResponse.json(mockResults);
    }

    // Use AI to analyze the PDF text
    const client = ModelClient("https://models.github.ai/inference", new AzureKeyCredential(token));

    const completion = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You're a helpful assistant for condo owners." },
          {
            role: "user",
            content: `Here's a condo fee document:\n\n${pdfText}\n\nPlease extract all itemized charges with the amount, category, a short description, and flag any questionable items (e.g., vague fees, unexplained legal/admin charges). Return a JSON array in the format: {category, amount, description, questionable}`,
          }
        ],
        model: "meta/Llama-3.2-11B-Vision-Instruct",
      },
    });

    if (isUnexpected(completion)) {
      return NextResponse.json({ error: completion.body.error }, { status: 500 });
    }

    const responseText = completion.body.choices[0].message.content;

    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } catch (parseError) {
      return NextResponse.json({ 
        error: "Failed to parse AI response", 
        raw: responseText 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('PDF analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}