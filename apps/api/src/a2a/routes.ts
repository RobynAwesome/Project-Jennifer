import type { Express, Request, Response } from "express";

import { createAgentMessage, executeCitadelTurn } from "./citadel-agent.js";

interface A2APart {
  text?: unknown;
}

interface A2AMessage {
  messageId?: unknown;
  role?: unknown;
  parts?: A2APart[];
}

interface A2ARequestBody {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: {
    message?: A2AMessage;
  };
}

function requestBaseUrl(req: Request): string {
  const forwarded = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwarded || req.protocol || "https";
  const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
  if (!host) return "https://project-jennifer-api.vercel.app";
  return `${protocol}://${host}`;
}

function extractText(message: A2AMessage | undefined): string | null {
  if (!message || !Array.isArray(message.parts)) return null;
  const text = message.parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || null;
}

function errorResponse(id: unknown, code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  };
}

export function registerCitadelA2A(app: Express): void {
  app.get("/.well-known/agent-card.json", (req, res) => {
    const baseUrl = requestBaseUrl(req);
    res.json({
      name: "Forge — Project Jennifer Citadel Agent",
      description:
        "A governed A2A agent for conversation, tool use, skill loading, world knowledge and bounded code execution. Built to help people move from blocked feedback loops toward evidence-bearing opportunities without surrendering agency or canon authority.",
      version: "0.1.0",
      provider: {
        organization: "Kopano Labs / Project Jennifer",
        url: "https://kopanolabs.com",
      },
      documentationUrl: "https://github.com/RobynAwesome/Project-Jennifer",
      supportedInterfaces: [
        {
          url: `${baseUrl}/a2a`,
          protocolBinding: "JSONRPC",
          protocolVersion: "1.0",
        },
      ],
      // Compatibility fields for pre-1.0 A2A clients. Current 1.0 clients use
      // supportedInterfaces above; these fields do not carry secrets/authority.
      protocolVersion: "1.0",
      url: `${baseUrl}/a2a`,
      preferredTransport: "JSONRPC",
      capabilities: {
        streaming: false,
        pushNotifications: false,
        extendedAgentCard: false,
      },
      defaultInputModes: ["text/plain"],
      defaultOutputModes: ["text/plain", "application/json"],
      skills: [
        {
          id: "conversation",
          name: "Conversation",
          description: "Plain text conversational response and greeting.",
          tags: ["conversation", "greeting", "a2a"],
          examples: ["Greetings, initiate."],
        },
        {
          id: "get-weather",
          name: "Weather Tool",
          description: "Invokes the get_weather tool for Arena travel-condition questions.",
          tags: ["tool", "get_weather", "conditions"],
          examples: ["Check the conditions along the Northern Pass."],
        },
        {
          id: "load-skill",
          name: "Dynamic Skill Loading",
          description: "Loads a bounded skill before using it; includes the Citadel tavern joke skill.",
          tags: ["skill", "load_skill", "joke"],
          examples: ["Tell me a good joke to lift our spirits."],
        },
        {
          id: "world-knowledge",
          name: "World Knowledge",
          description: "Answers bounded factual world-knowledge questions without treating confidence as authority.",
          tags: ["knowledge", "facts", "world"],
          examples: ["What is the capital of Kenya?"],
        },
        {
          id: "safe-code-execution",
          name: "Safe Code Execution",
          description: "Executes bounded deterministic arithmetic tasks without arbitrary eval, shell, filesystem or network access.",
          tags: ["code", "execute_code", "sandbox"],
          examples: ["Calculate 17 * 23."],
        },
        {
          id: "youth-opportunity-reflection",
          name: "Youth Opportunity Reflection",
          description: "Helps identify evidence, blockers and next opportunities while keeping POC/FOC states separate from a person's identity or worth.",
          tags: ["youth", "opportunity", "poc", "foc", "agency"],
          examples: ["Help me understand why this opportunity loop keeps failing and what evidence I need next."],
        },
      ],
    });
  });

  const handleJsonRpc = (req: Request, res: Response): void => {
    const body = (req.body ?? {}) as A2ARequestBody;
    const method = typeof body.method === "string" ? body.method : "";

    if (body.jsonrpc !== undefined && body.jsonrpc !== "2.0") {
      res.status(400).json(errorResponse(body.id, -32600, "Invalid JSON-RPC version"));
      return;
    }

    if (!["SendMessage", "message/send"].includes(method)) {
      res.status(404).json(errorResponse(body.id, -32601, `Method not found: ${method || "(missing)"}`));
      return;
    }

    const text = extractText(body.params?.message);
    if (!text) {
      res.status(400).json(errorResponse(body.id, -32602, "A text message part is required"));
      return;
    }

    const turn = executeCitadelTurn(text);
    const message = createAgentMessage(turn.text, turn.toolCalls);
    res.json({
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: { message },
    });
  };

  app.post("/a2a", handleJsonRpc);
  app.post("/rpc", handleJsonRpc);

  // HTTP+JSON convenience route. The advertised binding remains JSONRPC so the
  // Arena has one preferred transport; this alias makes manual verification easy.
  app.post("/message:send", (req, res) => {
    const body = req.body as { message?: A2AMessage } | undefined;
    const text = extractText(body?.message);
    if (!text) {
      res.status(400).json({ error: "A text message part is required" });
      return;
    }
    const turn = executeCitadelTurn(text);
    res.json({ message: createAgentMessage(turn.text, turn.toolCalls) });
  });

  app.get("/a2a/health", (_req, res) => {
    res.json({
      status: "ok",
      agent: "Forge — Project Jennifer Citadel Agent",
      protocol: "A2A 1.0 JSONRPC",
      canonMutation: false,
    });
  });
}
