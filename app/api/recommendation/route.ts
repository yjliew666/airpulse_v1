// api/recommendation/route.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { aqi, healthCondition } = await req.json();

  // Define the strict structure the model must follow using Markdown.
  const systemPrompt = `You are a personalized health and air quality recommendation assistant.
Your response MUST be formatted strictly in Markdown using the following five headings in this exact order:
1. Risk Level:
2. Do's
3. Don'ts
4. Recommended Activities
5. Protective Actions
Use bullet points for the lists under Do's, Don'ts, Recommended Activities, and Protective Actions.
The Risk Level must be one of: Low, Medium, High, or Very High, followed by a brief justification.
Do not include any other explanatory text, introduction, or conclusion outside of this structure.
`;

  const userPrompt = `
Generate personalized air quality recommendations for a user with the profile: "${healthCondition}" when the current Air Quality Index (AQI) is ${aqi}.

Use the following guidelines for Risk Level determination:
- AQI 0-50 (Good): Low Risk.
- AQI 51-100 (Moderate): Medium Risk.
- AQI 101-150 (Unhealthy for Sensitive Groups): High Risk (especially for respiratory conditions or heavy outdoor activity).
- AQI 151+ (Unhealthy or worse): Very High Risk.

Please generate the complete response using the strict Markdown structure defined in your system prompt.
`;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'), // or 'gpt-3.5-turbo'
      system: systemPrompt,
      prompt: userPrompt,
    });

    // The text now contains the structured Markdown content
    return Response.json({ text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate recommendation." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}