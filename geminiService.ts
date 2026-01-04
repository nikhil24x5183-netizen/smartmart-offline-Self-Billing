
import { GoogleGenAI, Type } from "@google/genai";
import { SaleRecord } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSalesSummary = async (sales: SaleRecord[]) => {
  if (!process.env.API_KEY) return "AI Insights unavailable (Offline or missing API Key).";
  
  try {
    const salesData = sales.map(s => ({
      total: s.total,
      itemCount: s.items.length,
      time: new Date(s.timestamp).toLocaleTimeString()
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these retail sales from today and provide a 2-sentence summary of performance: ${JSON.stringify(salesData)}`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this moment.";
  }
};
