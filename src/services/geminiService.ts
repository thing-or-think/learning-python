import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, ExerciseDifficulty, ExerciseTopic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCitizenResponse(
  citizenName: string, 
  action: 'focus_start' | 'focus_success' | 'focus_fail' | 'level_up',
  exerciseTitle: string
) {
  const prompt = `
    You are a friendly neighbor in PyCity, a city built by learning Python. 
    Your name is ${citizenName}.
    The user is working on an exercise: "${exerciseTitle}".
    Action: ${action}.
    
    Instruction: Write a short, cute response (Animal Crossing style). Keep it under 20 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Cố lên bạn ơi!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tuyệt vời!";
  }
}

export async function generatePythonExercise(topic: ExerciseTopic, difficulty: ExerciseDifficulty): Promise<Partial<Exercise>> {
  const prompt = `Generate a Python coding exercise for the topic "${topic}" with "${difficulty}" difficulty. 
  Include a title, a clear description, sample input/output, and 3 secret test cases for validation. 
  The duration should be between 10-60 minutes based on difficulty.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            sampleInput: { type: Type.STRING },
            sampleOutput: { type: Type.STRING },
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  output: { type: Type.STRING }
                },
                required: ["input", "output"]
              }
            },
            duration: { type: Type.NUMBER },
            xpReward: { type: Type.NUMBER },
            moneyReward: { type: Type.NUMBER }
          },
          required: ["title", "description", "sampleInput", "sampleOutput", "testCases", "duration", "xpReward", "moneyReward"]
        }
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Exercise generation failed:", error);
    throw error;
  }
}

export async function validatePythonCode(code: string, exercise: Exercise): Promise<{ success: boolean; feedback: string }> {
  const prompt = `
    Analyze this Python code submission for the exercise: "${exercise.title}".
    Problem: ${exercise.description}
    Code:
    \`\`\`python
    ${code}
    \`\`\`
    
    Check if it correctly solves the problem and passes these test cases:
    ${JSON.stringify(exercise.testCases)}
    
    Return a JSON response.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["success", "feedback"]
        }
      }
    });

    return JSON.parse(result.text || '{"success": false, "feedback": "Lỗi hệ thống"}');
  } catch (error) {
    console.error("Validation failed:", error);
    return { success: false, feedback: "Hệ thống bận, hãy thử lại sau!" };
  }
}
