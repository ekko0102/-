import { GoogleGenAI } from "@google/genai";
import { OracleResponse } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getGothicOraclePrediction = async (currentLevel: number, weather: string): Promise<OracleResponse> => {
  const ai = getAI();
  if (!ai) {
    return {
      text: "The spirits are silent (API Key missing).",
      effect: undefined
    };
  }

  try {
    const prompt = `
      You are a cryptic, gothic oracle in a dark farming game. 
      The player is Level ${currentLevel}. 
      Generate a short, atmospheric prediction (max 20 words) about the farm.
      Also, choose a random gameplay effect from these options: 'growth_boost', 'price_surge', 'gloom'.
      
      Output strictly in JSON format:
      {
        "text": "Your cryptic message here.",
        "effect": "growth_boost"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned");
    
    return JSON.parse(jsonText) as OracleResponse;
  } catch (error) {
    console.error("Oracle fetch failed:", error);
    return {
      text: "The fog is too thick to see the future.",
      effect: undefined
    };
  }
};
