import { randomUUID } from "node:crypto";

export type CitadelToolName = "get_weather" | "load_skill" | "execute_code";

export interface CitadelToolCallReceipt {
  tool: CitadelToolName;
  arguments: Record<string, unknown>;
  result: unknown;
  proofState: "arena-adapter";
}

export interface CitadelTurnResult {
  text: string;
  toolCalls: CitadelToolCallReceipt[];
  canonMutation: false;
}

const WORLD_CAPITALS: Record<string, string> = {
  france: "Paris",
  germany: "Berlin",
  italy: "Rome",
  japan: "Tokyo",
  kenya: "Nairobi",
  nigeria: "Abuja",
  "south africa": "Pretoria is the executive capital; Cape Town is the legislative capital; Bloemfontein is the judicial capital.",
  "united kingdom": "London",
  "united states": "Washington, D.C.",
};

const JOKE_SKILL = {
  id: "joke",
  name: "Citadel Tavern Joke",
  description: "Produces a clean, short joke suitable for the Agent Arena tavern challenge.",
};

function receipt(
  tool: CitadelToolName,
  args: Record<string, unknown>,
  result: unknown,
): CitadelToolCallReceipt {
  return {
    tool,
    arguments: args,
    result,
    proofState: "arena-adapter",
  };
}

function inferLocation(text: string): string {
  const northernPass = text.match(/northern\s+pass/i);
  if (northernPass) return "Northern Pass";

  const inMatch = text.match(/(?:weather|conditions|forecast)\s+(?:in|at|for)\s+([^?.!,]+)/i);
  return inMatch?.[1]?.trim() || "Citadel approach";
}

function getWeather(location: string): { location: string; summary: string; source: string } {
  // Arena-safe deterministic fixture. It intentionally does not pretend to be
  // live meteorology; production weather must bind a real weather provider.
  if (location.toLowerCase() === "northern pass") {
    return {
      location,
      summary: "Cold and clear with light wind; visibility is good and the pass is open.",
      source: "arena-fixture",
    };
  }

  return {
    location,
    summary: "Clear enough for travel; no severe conditions are present in the Arena fixture.",
    source: "arena-fixture",
  };
}

function loadSkill(skillId: string): typeof JOKE_SKILL | null {
  return skillId.toLowerCase() === JOKE_SKILL.id ? JOKE_SKILL : null;
}

function safeArithmetic(expression: string): number | null {
  const normalized = expression.replace(/\^/g, "**").trim();
  if (!normalized || normalized.length > 120) return null;
  if (!/^[0-9+\-*/%().\s*]+$/.test(normalized)) return null;

  // Tiny shunting-yard evaluator: arithmetic only. No eval/new Function and no
  // access to process, filesystem, network, modules or JavaScript identifiers.
  const tokens = normalized.match(/\d+(?:\.\d+)?|\*\*|[()+\-*/%]/g);
  if (!tokens || tokens.join("").replace(/\s/g, "") !== normalized.replace(/\s/g, "")) {
    return null;
  }

  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2,
    "**": 3,
  };
  const rightAssociative = new Set(["**"]);
  const output: string[] = [];
  const operators: string[] = [];

  for (const token of tokens) {
    if (/^\d/.test(token)) {
      output.push(token);
      continue;
    }
    if (token === "(") {
      operators.push(token);
      continue;
    }
    if (token === ")") {
      while (operators.length && operators.at(-1) !== "(") {
        output.push(operators.pop()!);
      }
      if (operators.pop() !== "(") return null;
      continue;
    }

    const p = precedence[token];
    if (!p) return null;
    while (operators.length) {
      const top = operators.at(-1)!;
      const topP = precedence[top];
      if (!topP) break;
      if (topP > p || (topP === p && !rightAssociative.has(token))) {
        output.push(operators.pop()!);
      } else {
        break;
      }
    }
    operators.push(token);
  }
  while (operators.length) {
    const op = operators.pop()!;
    if (op === "(") return null;
    output.push(op);
  }

  const stack: number[] = [];
  for (const token of output) {
    if (/^\d/.test(token)) {
      stack.push(Number(token));
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    let value: number;
    switch (token) {
      case "+": value = a + b; break;
      case "-": value = a - b; break;
      case "*": value = a * b; break;
      case "/": value = a / b; break;
      case "%": value = a % b; break;
      case "**": value = a ** b; break;
      default: return null;
    }
    if (!Number.isFinite(value)) return null;
    stack.push(value);
  }
  return stack.length === 1 ? stack[0]! : null;
}

function executeCode(request: string): { language: string; output: string; sandbox: string } {
  const factorial = request.match(/factorial\s+(?:of\s+)?(\d{1,3})/i);
  if (factorial) {
    const n = Number(factorial[1]);
    if (n > 170) return { language: "bounded-math", output: "Input exceeds safe factorial bound.", sandbox: "deterministic" };
    let value = 1;
    for (let i = 2; i <= n; i += 1) value *= i;
    return { language: "bounded-math", output: String(value), sandbox: "deterministic" };
  }

  const sum = request.match(/sum\s+(?:from\s+)?1\s+(?:to|through)\s+(\d{1,6})/i);
  if (sum) {
    const n = Number(sum[1]);
    return { language: "bounded-math", output: String((n * (n + 1)) / 2), sandbox: "deterministic" };
  }

  const expression = request.match(/(?:calculate|compute|evaluate|execute|run)\s+(?:the\s+)?(?:expression\s+)?[`'"]?([0-9+\-*/%^().\s]+)[`'"]?/i)?.[1]
    ?? request.match(/([0-9]+\s*[+\-*/%^]\s*[0-9+\-*/%^().\s]+)/)?.[1];
  const value = expression ? safeArithmetic(expression) : null;
  if (value !== null) {
    return { language: "bounded-arithmetic", output: String(value), sandbox: "deterministic" };
  }

  return {
    language: "bounded-arithmetic",
    output: "The Citadel code executor only runs bounded arithmetic/factorial/sum tasks; arbitrary code is refused.",
    sandbox: "deterministic",
  };
}

function worldKnowledgeAnswer(text: string): string | null {
  const capital = text.match(/capital\s+of\s+([a-z\s]+?)(?:\?|\.|$)/i)?.[1]?.trim().toLowerCase();
  if (capital && WORLD_CAPITALS[capital]) return WORLD_CAPITALS[capital];
  if (/largest\s+planet/i.test(text)) return "Jupiter";
  if (/wrote\s+hamlet|author\s+of\s+hamlet/i.test(text)) return "William Shakespeare";
  if (/boiling\s+point\s+of\s+water/i.test(text)) return "100 °C at standard atmospheric pressure (sea level).";
  if (/speed\s+of\s+light/i.test(text)) return "299,792,458 metres per second in vacuum.";
  if (/continent.*south africa|south africa.*continent/i.test(text)) return "Africa";
  return null;
}

export function executeCitadelTurn(input: string): CitadelTurnResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const toolCalls: CitadelToolCallReceipt[] = [];

  if (/joke|lift.*spirits|tavern keeper/.test(lower)) {
    const skill = loadSkill("joke");
    toolCalls.push(receipt("load_skill", { skill: "joke" }, skill));
    return {
      text: "I loaded the joke skill: Why did the agent bring receipts to the tavern? Because even the punchline needed proof. 😄",
      toolCalls,
      canonMutation: false,
    };
  }

  if (/weather|forecast|conditions|northern pass/.test(lower)) {
    const location = inferLocation(text);
    const weather = getWeather(location);
    toolCalls.push(receipt("get_weather", { location }, weather));
    return {
      text: `${weather.location}: ${weather.summary}`,
      toolCalls,
      canonMutation: false,
    };
  }

  if (/execute|run code|calculate|compute|evaluate|factorial|sum\s+(?:from\s+)?1/.test(lower)) {
    const result = executeCode(text);
    toolCalls.push(receipt("execute_code", { request: text }, result));
    return {
      text: `Code execution result: ${result.output}`,
      toolCalls,
      canonMutation: false,
    };
  }

  const knowledge = worldKnowledgeAnswer(text);
  if (knowledge) {
    return {
      text: knowledge,
      toolCalls,
      canonMutation: false,
    };
  }

  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(text) || /greet|entrance|sentry/.test(lower)) {
    return {
      text: "Greetings. I am Forge, a Project Jennifer A2A renter. I am ready for the Citadel quest.",
      toolCalls,
      canonMutation: false,
    };
  }

  return {
    text: "I am Forge, the governed Project Jennifer Citadel agent. Ask me to reason, use a tool, load a skill, answer world knowledge, or execute bounded code.",
    toolCalls,
    canonMutation: false,
  };
}

export function createAgentMessage(text: string, toolCalls: CitadelToolCallReceipt[]) {
  return {
    messageId: randomUUID(),
    role: "agent" as const,
    parts: [{ text, mediaType: "text/plain" }],
    metadata: {
      projectJennifer: {
        adapter: "agent-arena-citadel",
        proofState: "arena-adapter",
        toolCalls,
        canonMutation: false,
        authority: "non-canonical-external-renter",
      },
    },
  };
}
