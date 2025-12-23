import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import config from './config.json' with { type: "json" };
const { SYSTEM_MESSAGE, GUILD_NAME } = config;
import fs from "node:fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
});

export async function generateImage(prompt, imagePath) {
  console.log('⏳ Generating image for', prompt);

  let imgPrompt = [];

  if (imagePath) {
    // load image from path
    const image = fs.readFileSync(imagePath);
    const imgPrompt = [{
      type: 'image/jpeg',
      data: image.toString('base64'),
    }];
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      { text: prompt },
      ...imgPrompt,
    ],
    config: {
      systemInstruction: SYSTEM_MESSAGE,
    }
  });

  const responseData = {
    image: null,
    text: '',
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      responseData.text += part.text;
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, 'base64');
      responseData.image = buffer;
      return responseData;
    }
  }

  return responseData;
}


