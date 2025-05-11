// app/api/gemini/route.ts

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';



// Initialize the Google Generative AI client

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: Request) {
  const { content } = await req.json();
  console.log('Received content:', content);

  // Make sure we have content to improve
  if (!content || content.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Content is required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Set safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Generate the improved content
    const prompt = `You are a helpful writing assistant. Your task is to improve the following blog content by enhancing clarity, fixing grammar issues, and adding relevant details where appropriate without changing the main topic.

Blog content to improve:
${content}

Please provide only the improved content without any additional explanations, commentary, or formatting instructions.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const response = result.response;
    const improvedContent = response.text();

    return new Response(JSON.stringify({ improvedContent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to improve content' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}