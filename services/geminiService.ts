import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ToneOfVoice } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

// Export the Chat type for use in components
export type { Chat };

export interface EmailInputs {
    goal: string;
    audience: string;
    message: string;
    tone: ToneOfVoice;
}

const buildBasePrompt = (inputs: EmailInputs): string => {
    return `
Email Goal: ${inputs.goal}
Target Audience: ${inputs.audience}
Key Message/Draft: ${inputs.message}
Tone of Voice: ${inputs.tone}
---
`;
};

export const startChat = (): Chat => {
    return ai.chats.create({ model: modelName });
};

export const generateSubjectLines = async (inputs: EmailInputs): Promise<string[]> => {
    const prompt = `${buildBasePrompt(inputs)}
Based on the details above, generate 5 creative and compelling subject lines.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject_lines: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.subject_lines || [];
    } catch (error) {
        console.error("Error generating subject lines:", error);
        return ["Sorry, there was an error generating subject lines."];
    }
};

export async function* composeEmailBodyStream(chat: Chat, inputs: EmailInputs): AsyncGenerator<string> {
    const prompt = `${buildBasePrompt(inputs)}
Based on the details above, compose a complete email body. The email should be engaging, clear, and ready to send. Do not include a subject line.
`;
    try {
        const responseStream = await chat.sendMessageStream({ message: prompt });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error composing email body:", error);
        yield "Sorry, there was an error composing the email body.";
    }
};

export async function* refineEmailBodyStream(chat: Chat, instruction: string): AsyncGenerator<string> {
    try {
        const responseStream = await chat.sendMessageStream({ message: instruction });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error refining email body:", error);
        yield "Sorry, there was an error refining the email body.";
    }
}

export const suggestAbTest = async (inputs: EmailInputs): Promise<string> => {
    const prompt = `${buildBasePrompt(inputs)}
Based on the email details above, suggest one concrete A/B test. This could be a variation of the subject line or a specific part of the email body. Provide a brief, clear explanation of what is being tested and why.
`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting A/B test:", error);
        return "Sorry, there was an error suggesting an A/B test.";
    }
};

export const getPersonalizationIdeas = async (inputs: EmailInputs): Promise<string> => {
    const prompt = `${buildBasePrompt(inputs)}
Based on the email details above, suggest 3 practical personalization ideas to increase engagement. Present the ideas as a bulleted or numbered list.
`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting personalization ideas:", error);
        return "Sorry, there was an error getting personalization ideas.";
    }
};

export const generateCTAs = async (inputs: EmailInputs): Promise<string[]> => {
    const prompt = `${buildBasePrompt(inputs)}
Based on the details above, generate 4 compelling and action-oriented Call-to-Action (CTA) texts for buttons.`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ctas: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.ctas || [];
    } catch (error) {
        console.error("Error generating CTAs:", error);
        return ["Sorry, there was an error generating CTAs."];
    }
};

export const analyzeForSpam = async (emailBody: string): Promise<string> => {
    const prompt = `
Analyze the following email body for words or phrases that might trigger spam filters.
Provide a brief analysis as a bulleted list, explaining why each identified item could be problematic. If possible, suggest alternatives. If no major issues are found, state that it looks good.

Email Body to Analyze:
---
${emailBody}
---
`;
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing for spam:", error);
        return "Sorry, there was an error analyzing the email for spam triggers.";
    }
};
