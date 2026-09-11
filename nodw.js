// language: JavaScript, file: api/index.js, target: Vercel Serverless, Node.js 18+
// *vercel serverless node.js function parsing dynamic json schemas and required properties*

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, schema, required } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    const config = {
      temperature: 0.2,
      responseMimeType: 'application/json',
    };

    if (schema) {
      config.responseSchema = schema;
      if (required && Array.isArray(required)) {
        config.responseSchema.required = required;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: config,
    });

    const parsedData = JSON.parse(response.text);
    return res.status(200).json({ status: 'success', data: parsedData });

  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
