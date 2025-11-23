import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow client-side usage if NEXT_PUBLIC_ key is set
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function sendMessageToGemini(
    message: string,
    history: { role: string; content: string }[],
    systemPrompt: string
) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const historyText = (history || [])
            .map((msg) => {
                const speaker = msg.role === "assistant" ? "Assistant" : "User";
                return `${speaker}: ${msg.content}`;
            })
            .join('\n');

        const prompt = `${systemPrompt}\n\nConversation history:\n${historyText || 'No previous messages.'}\n\nUser: ${message}\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

export async function analyzeSentimentWithGemini(text: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Analyze the sentiment of the following text.
      Return ONLY a JSON object with the following format:
      {
        "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "score": number (0.0 to 1.0),
        "emotion": "string" (e.g., joy, stress, anger, fatigue)
      }
      
      Text: "${text}"
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Error analyzing sentiment with Gemini:", error);
        // Fallback
        return {
            sentiment: "NEUTRAL",
            score: 0.5,
            emotion: "neutral"
        };
    }
}
