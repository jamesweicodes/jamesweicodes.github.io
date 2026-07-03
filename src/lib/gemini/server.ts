import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRequiredEnv } from "@/lib/env";

let client: GoogleGenerativeAI | null = null;

export function getGeminiModel() {
  if (!client) {
    client = new GoogleGenerativeAI(getRequiredEnv("GEMINI_API_KEY"));
  }

  return client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
    },
  });
}
