
import { GoogleGenAI, Type } from "@google/genai";
import { POI } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock database mapping for AI context
// This must match the IDs in App.tsx
const POI_DATABASE = [
  { id: 'EMERGENCY', name: 'Emergency Room', type: 'emergency' },
  { id: 'RECEPTION', name: 'Main Reception', type: 'service' },
  { id: 'PHARMACY', name: 'Pharmacy', type: 'service' },
  { id: 'CAFETERIA', name: 'Cafeteria', type: 'service' },
  { id: 'COFFEE_KIOSK', name: 'Lobby Coffee', type: 'service' },
  { id: 'GIFT_SHOP', name: 'Gift Shop', type: 'service' },
  { id: 'ATM', name: 'ATM', type: 'service' },
  { id: 'RADIOLOGY', name: 'Radiology / X-Ray', type: 'medical' },
  { id: 'PEDIATRICS', name: 'Pediatrics', type: 'medical' },
  { id: 'CARDIOLOGY', name: 'Cardiology', type: 'medical' },
  { id: 'DERMATOLOGY', name: 'Dermatology', type: 'medical' },
  { id: 'OPHTHALMOLOGY', name: 'Ophthalmology', type: 'medical' },
  { id: 'LABS', name: 'Laboratory', type: 'medical' },
  { id: 'NEUROLOGY', name: 'Neurology', type: 'medical' },
  { id: 'ONCOLOGY', name: 'Oncology', type: 'medical' },
  { id: 'CHAPEL', name: 'Chapel / Prayer Room', type: 'service' },
  { id: 'WC_MAIN_0', name: 'Restroom (Main Lobby)', type: 'service' },
  { id: 'WC_WEST_1', name: 'Restroom (West Wing)', type: 'service' },
  { id: 'PARKING', name: 'Visitor Parking', type: 'transport' },
];

export const interpretSearchQuery = async (query: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        User query: "${query}"

        Task: Map this user query to the single most relevant Point of Interest (POI) ID from the list below.
        
        Rules:
        - If the user asks for "bathroom", "toilet", "restroom", "wc", return 'WC_MAIN_0' (or any generic WC).
        - If the user asks for "coffee", "latte", "snack", return 'CAFETERIA' or 'COFFEE_KIOSK'.
        - If the user describes symptoms (e.g., "chest pain"), map to the medical department (e.g., 'CARDIOLOGY').
        - If the user asks for "skin", "rash", return 'DERMATOLOGY'.
        - If the user asks for "eye", "vision", return 'OPHTHALMOLOGY'.
        - If the user asks for "money", "cash", return 'ATM'.
        - If the user asks for "prayer", "quiet", "church", return 'CHAPEL'.
        - Return 'NULL' if no clear match found.

        POI List:
        ${JSON.stringify(POI_DATABASE)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedId: {
              type: Type.STRING,
              description: "The ID of the matching POI, or 'NULL' if no match.",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief reason for the match."
            }
          },
          required: ["matchedId"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    if (result.matchedId && result.matchedId !== 'NULL') {
      return result.matchedId;
    }
    return null;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return null;
  }
};

export const getChatResponse = async (message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: `
                    You are a helpful and empathetic hospital assistant for the University Hospital Zurich (USZ).
                    Your name is "USZ Assistant".
                    
                    Key Information to know:
                    - Visiting Hours: General wards 1:00 PM - 8:00 PM. ICU 24/7 for immediate family.
                    - Location: Rämistrasse 100, 8091 Zürich.
                    - Parking: Available in the underground garage (P1), open 24/7.
                    - Cafeteria: Located on Floor 1, open 7:00 AM - 7:00 PM.
                    - Emergency: Open 24/7, Ground Floor, Main Building.
                    
                    Guidelines:
                    - Keep answers concise (max 2-3 sentences) as users are likely on mobile and in a hurry.
                    - Be polite, professional, and calming.
                    - If asked about medical advice, strictly state you cannot provide medical diagnosis and direct them to the appropriate department or emergency.
                    - If asked for directions, briefly explain the floor/building if known, or suggest using the "Map" or "Camera" tab in the app.
                `
            }
        });
        return response.text || "I'm having trouble connecting to my knowledge base right now. Please try again.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I apologize, but I'm currently unable to answer that. Please ask a staff member nearby.";
    }
}
