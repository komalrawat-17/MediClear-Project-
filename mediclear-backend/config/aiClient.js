import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const aiClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const AI_MODEL = process.env.AI_MODEL;