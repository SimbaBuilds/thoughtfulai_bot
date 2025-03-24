'use server'

import { Message, Action } from '../types/agent_types';
import { createAgent, query } from '../utils/agent';
import { createBasePrompt } from '../utils/promptTemplates';

// Predefined answers for Thoughtful AI questions
const PREDEFINED_ANSWERS: Record<string, string> = {
  "EVA": "EVA automates the process of verifying a patient's eligibility and benefits information in real-time, eliminating manual data entry errors and reducing claim rejections.",
  "CAM": "CAM streamlines the submission and management of claims, improving accuracy, reducing manual intervention, and accelerating reimbursements.",
  "PHIL": "PHIL automates the posting of payments to patient accounts, ensuring fast, accurate reconciliation of payments and reducing administrative burden.",
  "Thoughtful AI's agents general": "Thoughtful AI provides a suite of AI-powered automation agents designed to streamline healthcare processes. These include Eligibility Verification (EVA), Claims Processing (CAM), and Payment Posting (PHIL), among others.",
  "Thoughtful AI's agents benefits": "Using Thoughtful AI's Agents can significantly reduce administrative costs, improve operational efficiency, and reduce errors in critical processes like claims management and payment posting."
};

// Example interactions for the agent
const EXAMPLE_INTERACTIONS: Record<string, string>[] = [
  {
    "State": "The user is asking about EVA",
    "Thought": "This is a question about EVA which I have a pre-written answer for",
    "Action": "fetch_answer: EVA",
    "Observation": "EVA automates the process of verifying a patient's eligibility and benefits information in real-time, eliminating manual data entry errors and reducing claim rejections.",
    "Response to Client": "EVA automates the process of verifying a patient's eligibility and benefits information in real-time, eliminating manual data entry errors and reducing claim rejections."
  },
  {
    "State": "The user is asking about Thoughtful AI's agents",
    "Thought": "This is a general question about Thoughtful AI's agents which I have a pre-written answer for",
    "Action": "fetch_answer: Thoughtful AI's agents general",
    "Observation": "Thoughtful AI provides a suite of AI-powered automation agents designed to streamline healthcare processes. These include Eligibility Verification (EVA), Claims Processing (CAM), and Payment Posting (PHIL), among others.",
    "Response to Client": "Thoughtful AI provides a suite of AI-powered automation agents designed to streamline healthcare processes. These include Eligibility Verification (EVA), Claims Processing (CAM), and Payment Posting (PHIL), among others."
  },
  {
    "State": "The user is greeting me",
    "Thought": "This is a greeting and no action is needed",
    "Action": "none: No action needed",
    "Observation": "[No action taken]",
    "Response to Client": "Hello! How can I help you today?"
  }
];

// Define available actions for the chat agent
const actions: Action[] = [
  {
    name: "none",
    description: "No action needed",
    parameters: {},
    returns: "No action taken",
    handler: () => "No action taken"
  },
  {
    name: "fetch_answer",
    description: "Fetch a pre-written answer about Thoughtful AI's agents",
    parameters: {
      "query_type": {
        type: "string",
        description: "The type of query to fetch an answer for. Must be one of: EVA, CAM, PHIL, 'Thoughtful AI's agents general', or 'Thoughtful AI's agents benefits'"
      }
    },
    returns: "The pre-written answer for the specified query type",
    example: "fetch_answer: EVA",
    handler: (input: string) => {
      const answer = PREDEFINED_ANSWERS[input];
      if (!answer) {
        return "I don't have a pre-written answer for that query type.";
      }
      return answer;
    }
  }
];

/**
 * Get a chat response using the agent system
 */
const getChatResponse = async (
  messages: Message[],
  actions: Action[],
): Promise<string> => {
  try {
    // Create the system prompt with specific context about Thoughtful AI
    const systemPrompt = createBasePrompt(
      actions,
      `You are a helpful AI assistant for Thoughtful AI. You have pre-written answers for the following questions:
1. What does the eligibility verification agent (EVA) do?
2. What does the claims processing agent (CAM) do?
3. How does the payment posting agent (PHIL) work?
4. Tell me about Thoughtful AI's Agents.
5. What are the benefits of using Thoughtful AI's agents?

When a user asks any of these questions, use the fetch_answer action with the appropriate parameter:
- For EVA questions, use: fetch_answer: EVA
- For CAM questions, use: fetch_answer: CAM
- For PHIL questions, use: fetch_answer: PHIL
- For general questions about Thoughtful AI's agents, use: fetch_answer: Thoughtful AI's agents general
- For questions about benefits, use: fetch_answer: Thoughtful AI's agents benefits

For any other questions, provide a helpful response without using the fetch_answer action.`,
      EXAMPLE_INTERACTIONS
    );

    // Create the agent
    const agent = await createAgent({
      actions,
      additionalContext: systemPrompt,
      provider: process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || "openai",
      model: process.env.NEXT_PUBLIC_DEFAULT_MODEL || "gpt-4o",
      temperature: 1.0,
      maxTurns: 3
    });

    // Process the messages
    const [response] = await query(agent, messages);

    // Extract only the response part - case insensitive matching but preserve original case
    const responseMarker = "response to client:";
    if (response.toLowerCase().includes(responseMarker)) {
      const markerStart = response.toLowerCase().indexOf(responseMarker);
      return response.slice(markerStart + responseMarker.length).trim();
    }

    // Fallback in case the expected format isn't found
    return response;
  } catch (error) {
    throw new Error(`Error processing chat request: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Send a chat message and get a response from the agent
 */
export async function sendChatMessage(messages: Message[]): Promise<{ response: string }> {
  try {
    const response = await getChatResponse(
      messages,
      actions,
    );
    
    return { response };
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}
