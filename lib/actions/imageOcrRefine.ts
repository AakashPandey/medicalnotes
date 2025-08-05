"use server";

type ImageScanInput = {
  imageUrl: string;
};

const systemPrompt = `Convert the provided image into Markdown. Ensure that all content from the page is included, such as headers, footers, subtexts, images (with alt text if possible). Return solely the Markdown content without any additional explanations or comments or delimiters like \`\`\`markdown or table lines.`;

export async function imageScanAI({ imageUrl }: ImageScanInput) {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error("Missing QWEN_API_KEY in environment variables.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to scan image: ${error}`);
  }

  const data = await response.json();
  let reply = data.choices?.[0]?.message?.content?.trim() || "";

  if (reply.startsWith("```markdown")) {
    reply = reply.replace(/^```markdown/, "").trim();
  }
  if (reply.endsWith("```")) {
    reply = reply.replace(/```$/, "").trim();
  }

  return reply;
}