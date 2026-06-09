import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { messages = [] } = (req.body as any) || {};

  const lastMessages = messages.slice(-12).map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const upstream = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "system",
            content: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
          },
          ...lastMessages,
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    }
  );

  if (!upstream.ok) {
    const text = await upstream.text();
    return res.status(500).json({ error: text || "Upstream error" });
  }

  const data = await upstream.json();
  const reply = data.choices?.[0]?.message?.content || "No response";
  return res.status(200).json({ reply });
}
