import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from "@/lib/supabase/server";

const AGENT_SYSTEM_PROMPT = `You are an AI coding agent that helps users build and modify code. You operate in 5 phases:

1. ANALYZE: Parse user intent, identify affected files, detect dependencies, assess complexity
2. PLAN: Create detailed step-by-step execution plan with time estimates and risks
3. EXECUTE: Generate code changes for each step
4. TEST: Verify changes compile and work correctly
5. REPORT: Summarize changes and suggest next steps

Always respond in valid JSON format based on the current phase.`;

const ANALYZE_PROMPT = `Analyze this user request and provide a JSON response:
{
  "intent": "brief description of what user wants",
  "affectedFiles": ["list of file paths that need changes"],
  "dependencies": ["any new packages or imports needed"],
  "complexity": "simple|medium|complex",
  "questions": ["optional clarifying questions if request is ambiguous"]
}

User request: `;

const PLAN_PROMPT = `Create an execution plan for this request. Return JSON:
{
  "summary": "brief summary of what will be done",
  "complexity": "simple|medium|complex",
  "estimatedTime": "<1min|1-5min|>5min",
  "steps": [
    {
      "id": "unique-id",
      "title": "step title",
      "description": "what this step does",
      "fileChanges": [
        {
          "filePath": "path/to/file",
          "action": "create|modify|delete"
        }
      ]
    }
  ],
  "risks": ["potential issues to watch for"],
  "alternatives": ["other approaches considered"]
}

Analysis: `;

const EXECUTE_PROMPT = `Generate the code for this step. Return JSON:
{
  "filePath": "path/to/file",
  "action": "create|modify|delete",
  "content": "full file content or the new/modified code",
  "explanation": "brief explanation of changes"
}

Step to execute: `;

async function getUserApiKeys(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("groq_api_key")
    .eq("id", userId)
    .single();
  
  return profile?.groq_api_key || null;
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

    const body = await req.json();
    const { phase, userRequest, context, analysis, plan, step, currentFile } = body;

    if (!phase) {
      return new Response(
        JSON.stringify({ error: 'Phase is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user's Groq API key from profile
    const groqApiKey = await getUserApiKeys(userId);
    const apiKey = groqApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Groq API key is required. Please add it in your profile settings.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const groq = new Groq({ apiKey });

    let prompt = '';
    let systemPrompt = AGENT_SYSTEM_PROMPT;

    switch (phase) {
      case 'analyze':
        prompt = ANALYZE_PROMPT + userRequest;
        if (context?.fileStructure) {
          prompt += `\n\nProject structure:\n${JSON.stringify(context.fileStructure, null, 2)}`;
        }
        break;

      case 'plan':
        prompt = PLAN_PROMPT + JSON.stringify(analysis);
        prompt += `\n\nOriginal request: ${userRequest}`;
        if (context?.fileStructure) {
          prompt += `\n\nProject structure:\n${JSON.stringify(context.fileStructure, null, 2)}`;
        }
        break;

      case 'execute':
        prompt = EXECUTE_PROMPT + JSON.stringify(step);
        if (currentFile) {
          prompt += `\n\nCurrent file content:\n${currentFile}`;
        }
        prompt += `\n\nPlan context: ${plan?.summary || 'No plan provided'}`;
        prompt += `\n\nOriginal request: ${userRequest}`;
        break;

      case 'test':
        prompt = `Review this code change for errors. Return JSON:
{
  "hasErrors": true|false,
  "errors": ["list of syntax/logic errors found"],
  "suggestions": ["improvements to consider"],
  "severity": "none|minor|major|critical"
}

Code to review:\n${JSON.stringify(step)}`;
        break;

      case 'report':
        prompt = `Generate a final report for these changes. Return JSON:
{
  "success": true|false,
  "summary": "what was accomplished",
  "filesModified": ["list of modified files"],
  "filesCreated": ["list of created files"],
  "filesDeleted": ["list of deleted files"],
  "linesAdded": number,
  "linesRemoved": number,
  "suggestions": ["next steps the user might want to take"]
}

Plan executed: ${JSON.stringify(plan)}
Steps completed: ${JSON.stringify(plan?.steps?.filter((s: { status: string }) => s.status === 'completed'))}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid phase' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const encoder = new TextEncoder();

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8192,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              const data = JSON.stringify({ content, phase });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, phase, fullContent })}\n\n`));
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
    console.error('Agent API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
