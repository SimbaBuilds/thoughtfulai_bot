export type Role = "user" | "assistant" | "system";
export type ContentType = "text" | "image";

export interface Message {
  role: Role;
  content: string;
  type: ContentType;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  response: string;
}

export interface ActionParameter {
  type: string;
  description: string;
}

export interface Action {
  name: string;
  description: string;
  parameters: Record<string, ActionParameter>;
  returns: string;
  example?: string;
  handler: (input: string) => string | Promise<string>;
}

export interface ModelProvider {
  generateResponse: (messages: Message[], temperature: number) => Promise<string>;
}

export interface AgentConfig {
  actions: Action[];
  additionalContext?: string;
  customExamples?: Record<string, string>[];
  provider?: string;
  model?: string;
  temperature?: number;
  maxTurns?: number;
}

export interface AgentState {
  modelProvider: ModelProvider;
  temperature: number;
  actions: Record<string, Action>;
  messages: Message[];
  maxTurns: number;
}

export type AgentResponse = [string, string | null];
