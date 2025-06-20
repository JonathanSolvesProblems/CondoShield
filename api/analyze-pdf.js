import { readFileSync } from "fs";
import pdf from "pdf-parse";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export default async function handler(req, res) {
  const { file } = req; // Assume you're using multer
  const dataBuffer = readFileSync(file.path);
  const pdfText = (await pdf(dataBuffer)).text;

  const token = process.env["GITHUB_TOKEN"];
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
    return res.status(500).json({ error: completion.body.error });
  }

  const responseText = completion.body.choices[0].message.content;

  try {
    const parsed = JSON.parse(responseText); // Expected to return AssessmentItem[]
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Failed to parse LLM response", raw: responseText });
  }
}
