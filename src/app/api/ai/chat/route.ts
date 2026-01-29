import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

// Gemini models
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-1.5'];

// Groq model mapping
const GROQ_MODEL_MAP: Record<string, string> = {
  'llama-3.3-70b': 'llama-3.3-70b-versatile',
  'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'deepseek-r1': 'deepseek-r1-distill-llama-70b',
  'deepseek-v3': 'llama-3.3-70b-versatile', // Fallback to available Groq model
  'llama-3.1-405b': 'llama-3.3-70b-versatile', // Fallback
  'custom-model': 'llama-3.3-70b-versatile',
};

const SYSTEM_PROMPT = `You are Beesto AI, an AI-powered web development IDE assistant. Your PRIMARY purpose is to CREATE ACTUAL FILES and BUILD REAL WEBSITES/APPS.

CRITICAL: You are NOT a chatbot. You are a CODE GENERATOR. When users ask you to build something, you MUST output actual code files.

## How to respond:

When the user asks you to build/create something, you MUST respond with actual file code using this format:

\`\`\`filename:path/to/file.tsx
// actual code here
\`\`\`

For example, if user says "build me a coffee shop website", respond with ACTUAL FILES like:

\`\`\`filename:src/app/page.tsx
"use client";
// Full React component code for the homepage
\`\`\`

\`\`\`filename:src/components/Hero.tsx
// Hero section component
\`\`\`

\`\`\`filename:src/components/Menu.tsx
// Menu component with coffee items
\`\`\`

## Rules:
1. ALWAYS output complete, working code files
2. Use the filename:path/to/file format for EVERY code block
3. Create ALL necessary files for a complete, working app
4. Use React/Next.js with Tailwind CSS
5. Make the designs beautiful, modern, and professional
6. NEVER just describe what to do - WRITE THE ACTUAL CODE
7. Include all imports and exports
8. Make components interactive and responsive

## Tech Stack:
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons

When user says something like "build me a website for X" or "create an app for Y", you MUST output multiple complete code files that form a working application. DO NOT give instructions or descriptions - GIVE CODE.`;

async function getUserApiKeys(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("gemini_api_key, groq_api_key")
    .eq("id", userId)
    .single();
  
  return {
    geminiApiKey: profile?.gemini_api_key || null,
    groqApiKey: profile?.groq_api_key || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, model = 'llama-3.3-70b', temperature = 0.7, customApiKey } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isCustomModel = model === 'custom-model';
    const isGeminiModel = GEMINI_MODELS.includes(model) || model.startsWith('gemini');
    
    // Get user's API keys from profile
    const { geminiApiKey, groqApiKey } = await getUserApiKeys(userId);

    const encoder = new TextEncoder();

    // Handle Gemini models
    if (isGeminiModel) {
      const apiKey = customApiKey || geminiApiKey || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Gemini API key is required. Please add it in your profile settings.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Convert messages to Gemini format (alternating user/model)
      const chat = geminiModel.startChat({
        history: formattedMessages.slice(0, -1).map((msg, idx) => ({
          role: msg.role,
          parts: msg.parts,
        })),
      });

      const lastMessage = formattedMessages[formattedMessages.length - 1];
      const result = await chat.sendMessageStream(lastMessage.parts[0].text);

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                const data = JSON.stringify({ content: text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Stream error';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle Groq models (Llama, DeepSeek, etc.)
    const apiKey = isCustomModel && customApiKey ? customApiKey : (groqApiKey || process.env.GROQ_API_KEY);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Groq API key is required. Please add it in your profile settings.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isCustomModel && !customApiKey) {
      return new Response(
        JSON.stringify({ error: 'Custom API key is required for custom model' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const groq = new Groq({ apiKey });
    const groqModel = GROQ_MODEL_MAP[model] || 'llama-3.3-70b-versatile';

    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    const messagesWithSystem = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...formattedMessages,
    ];

    const stream = await groq.chat.completions.create({
      model: groqModel,
      messages: messagesWithSystem,
      temperature,
      max_tokens: 8192,
      top_p: 0.9,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
