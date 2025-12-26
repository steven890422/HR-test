import { GoogleGenAI, Type } from "@google/genai";
import { Group, AiTeamNameResponse } from "../types";

export const generateCreativeTeamNames = async (groups: Group[]): Promise<AiTeamNameResponse> => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare the input for the model
  const groupsData = groups.map((g, idx) => ({
    index: idx,
    members: g.members.map(m => m.name)
  }));

  const prompt = `
    I have formed ${groups.length} teams for a company activity.
    Here are the members for each team: ${JSON.stringify(groupsData)}.
    
    Please generate a creative, fun, and professional "Team Name" and a short "Motto" (Slogan) for each team.
    The response must be in Traditional Chinese (Taiwan).
    Make the names diverse (e.g., related to animals, space, superheroes, or abstract positive concepts).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            groups: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER },
                  teamName: { type: Type.STRING },
                  motto: { type: Type.STRING }
                },
                required: ["index", "teamName", "motto"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as AiTeamNameResponse;

  } catch (error) {
    console.error("Error generating team names:", error);
    throw error;
  }
};