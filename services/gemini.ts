import { Schema, Type } from "@google/generative-ai";
import { z } from "zod";
import { ExecutionPlan, RiskLevel, TaskResult, UserProfile } from "../types";
import {
  getAllToolsForGemini,
  moniepointTool,
  chowdeckTool,
  emailTool
} from "../tools";
import { Tool } from "../tools/types";
import { getErrorMessage } from "./errorHandler";

// --- Configuration ---
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

// --- Tool Registry ---
// Map tool names to their instances for execution
const tools: Record<string, Tool> = {
  [moniepointTool.name]: moniepointTool,
  [chowdeckTool.name]: chowdeckTool,
  [emailTool.name]: emailTool,
};

// Tools formatted for Gemini API
const allTools = getAllToolsForGemini();

// --- API Helper ---
async function callGeminiApi(payload: any) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

// --- Zod Definitions ---

const apiPlanSchema = z.object({
  title: z.string(),
  intent: z.string(),
  reasoning: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  requiredTools: z.array(z.string()),
  steps: z.array(z.object({
    id: z.string(),
    description: z.string(),
    tool: z.string(),
    params: z.unknown().optional(),
    status: z.enum(["pending"])
  }))
});

const apiExecuteSchema = z.object({
  // We expect a simplified result or complex one, but for execution 
  // we usually get a result string or object.
  // Wait, executeTaskWithAgent expects string result? 
  // No, it handles tool calls.
  // Actually the `executeTaskWithAgent` returns a string (result of the step).
  // Let's verify usage.
  // The previous implementation returned `result.response.text()`.
  // The `executeTaskWithAgent` returns `TaskResult`? No it updates the task.
  // Wait, `executeTaskWithAgent` accepts `ExecutionPlan` and returns `TaskResult` (from `App.tsx` interaction).
  // Let's ensure the validator matches.
  // Actually, `executeTaskWithAgent` in previous `gemini.ts` was returning... what?
  // It was using `apiExecuteSchema`.
  // Let's define it loosely for now or strictly if we know.
  // Assuming it returns JSON with result summary and cost.
}).passthrough(); // Allow pass through for now or define strictly if known.

// Actually, let's look at `executeTaskWithAgent` logic below.

// --- Planning Phase ---
export async function createExecutionPlan(userRequest: string, userContext: any) {
  const prompt = `
USER REQUEST: "${userRequest}"
USER CONTEXT: ${JSON.stringify(userContext)}

Based on the available tools, create a step-by-step execution plan.
Title: Short title
Intent: What user wants
Reasoning: Why this plan
RiskLevel: low/medium/high
Steps: Array of steps (id, description, tool, params, status='pending')
RequiredTools: Array of tool names

RETURN ONLY JSON.
`;

  try {
    const planSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        intent: { type: "string" },
        reasoning: { type: "string" },
        riskLevel: { type: "string", enum: ["low", "medium", "high"] },
        requiredTools: { type: "array", items: { type: "string" } },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              tool: { type: "string" },
              status: { type: "string", enum: ["pending"] }
            },
            required: ["id", "description", "tool", "status"]
          }
        }
      },
      required: ["title", "intent", "reasoning", "riskLevel", "requiredTools", "steps"]
    };

    return await generateWithRetry(PRIMARY_MODEL, async (modelId) => {
      return await callGeminiApi({
        model: modelId,
        systemInstruction: "You are a planning agent. Return a valid JSON object with: title (string), intent (string), reasoning (string), riskLevel (low/medium/high), requiredTools (array of strings), steps (array of objects with id, description, tool, status='pending').",
        prompt: prompt,
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
    }, apiPlanSchema);
  } catch (error) {
    console.error("Planning Error:", error);
    throw error;
  }
}

// --- Execution Phase ---
export async function executeTaskWithAgent(plan: ExecutionPlan) {
  const prompt = `
EXECUTE THIS PLAN:
${JSON.stringify(plan, null, 2)}

Provide the result of the first PENDING step.
If a tool is needed, specify the tool call parameters.
RETURN ONLY JSON with:
summary: string
costIncurred: string (optional)
`;

  // We need a specific schema for execution result
  const executionResultSchema = z.object({
    summary: z.string(),
    costIncurred: z.string().optional()
  });

  try {
    return await generateWithRetry(PRIMARY_MODEL, async (modelId) => {
      return await callGeminiApi({
        model: modelId,
        systemInstruction: "You are an execution agent.",
        tools: allTools,
        prompt: prompt,
        generationConfig: { responseMimeType: "application/json" }
      });
    }, executionResultSchema);
  } catch (error) {
    console.error("Execution Error:", error);
    throw error;
  }
}

// --- Helper: Retry Logic ---
async function generateWithRetry<T>(
  modelId: string,
  generateFn: (model: string) => Promise<any>,
  validator: z.ZodSchema<T>,
  retries = 2
): Promise<T> {
  let lastError;
  const models = [modelId, FALLBACK_MODEL];

  for (const m of models) {
    try {
      // console.log(`Trying model: ${m}`);
      const rawText = await generateFn(m);

      if (!rawText) throw new Error("Empty response from AI");

      // Clean up markdown code blocks if present
      const jsonText = rawText.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(jsonText);
      return validator.parse(parsed);

    } catch (error) {
      console.warn(`Model ${m} failed:`, error);
      lastError = error;
      if (m === FALLBACK_MODEL) break;
    }
  }

  throw lastError || new Error("All models failed");
}
