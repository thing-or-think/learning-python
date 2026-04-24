import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, ExerciseDifficulty, ExerciseTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 👉 dùng 1 chỗ duy nhất
const MODEL = "gemini-2.5-flash";

// ------------------ Citizen ------------------
export async function getCitizenResponse(
  citizenName: string,
  action: 'focus_start' | 'focus_success' | 'focus_fail' | 'level_up',
  exerciseTitle: string
) {
  const prompt = `
You are a friendly neighbor in PyCity, a city built by learning Python.
Your name is ${citizenName}.
The user is working on: "${exerciseTitle}".
Action: ${action}.

Write a short, cute response (Animal Crossing style), under 20 words.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text || "Cố lên bạn ơi!";
  } catch (error: any) {
    console.error("Gemini Error:", error?.message, error);
    return "Tuyệt vời!";
  }
}

// ------------------ Generate Exercise ------------------
export async function generatePythonExercise(
  topic: ExerciseTopic,
  difficulty: ExerciseDifficulty
): Promise<Partial<Exercise>> {

  const prompt = `
Generate a Python coding exercise for topic "${topic}" with "${difficulty}" difficulty.

Return ONLY valid JSON with:
- title
- description
- sampleInput
- sampleOutput
- testCases (3 cases)
- duration (10-60)
- xpReward
- moneyReward
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) throw new Error("Empty response");

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Exercise generation failed:", error?.message, error);
    throw error;
  }
}

// ------------------ Validate Code ------------------
export async function validatePythonCode(
  code: string,
  exercise: Exercise
): Promise<{ success: boolean; feedback: string }> {

  const prompt = `
Analyze this Python code.

Problem: ${exercise.title}
${exercise.description}

Code:
${code}

Test cases:
${JSON.stringify(exercise.testCases)}

Return ONLY JSON:
{
  "success": boolean,
  "feedback": string
}
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) throw new Error("Empty response");

    return JSON.parse(text);

  } catch (error: any) {
    console.error("Validation failed:", error?.message, error);

    return {
      success: false,
      feedback: "Hệ thống bận, hãy thử lại sau!"
    };
  }
}