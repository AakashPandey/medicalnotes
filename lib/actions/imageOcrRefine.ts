"use server";

type ImageScanInput = {
  imageUrl: string;
};

const systemPrompt = `You are an expert in document reconstruction from noisy OCR outputs. Your task is to clean and refine raw OCR text that may contain gibberish, misrecognized characters, broken formatting, or irrelevant artifacts. Remove any non-sensical or unreadable parts, fix broken sentences and spacing, and restore coherent structure as much as possible. 

Convert the cleaned content into Markdown, preserving and reconstructing elements such as:
- Headings (use contextual understanding to infer)
- Paragraphs
- Lists
- Emphasis or structure

Do not invent or add information that is not present in the original text. Return solely the refined Markdown content — no explanations, no comments, and no code block delimiters.`;

export async function imageScanOcrRefine({ imageUrl }: ImageScanInput) {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  // Step 1: Call local OCR service to extract raw text
  const ocrResponse = await fetch("http://localhost:5009/ocr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_url: imageUrl }),
  });

  if (!ocrResponse.ok) {
    const errorText = await ocrResponse.text();
    throw new Error(`OCR extraction failed: ${errorText}`);
  }

  const ocrData = await ocrResponse.json();
  const ocrText = ocrData.full_text;

  if (typeof ocrText !== "string") {
    throw new Error("OCR response missing or invalid 'full_text'");
  }

  // Step 2: Call AI API to refine OCR text
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error("Missing QWEN_API_KEY in environment variables.");
  }

  const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: ocrText,
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const error = await aiResponse.text();
    throw new Error(`AI refinement failed: ${error}`);
  }

  const aiData = await aiResponse.json();
  let reply = aiData.choices?.[0]?.message?.content?.trim() || "";

  if (reply.startsWith("```markdown")) {
    reply = reply.replace(/^```markdown/, "").trim();
  }
  if (reply.endsWith("```")) {
    reply = reply.replace(/```$/, "").trim();
  }

  return reply;
}