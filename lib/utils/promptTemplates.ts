import { Action } from '../types/agent_types';

/**
 * Formats a single action into a string description
 */
export const formatAction = (action: Action): string => {
  const actionLines = [
    `${action.name}:`,
    `  Description: ${action.description}`,
    "  Parameters:"
  ];
  
  for (const [paramName, paramDetails] of Object.entries(action.parameters)) {
    const paramType = paramDetails.type || "any";
    const paramDesc = paramDetails.description || "";
    actionLines.push(`    - ${paramName} (${paramType}): ${paramDesc}`);
  }
  
  actionLines.push(`  Returns: ${action.returns}`);
  
  if (action.example) {
    actionLines.push(`  Example: ${action.example}`);
  }
  
  return actionLines.join("\n");
};

/**
 * Creates a base system prompt that can be customized
 */
export const createBasePrompt = (
  actions: Action[],
  additionalContext: string = "No additional context",
  examples?: (string | Record<string, string>)[]
): string => {
  const currentDate = new Date().toISOString();
  
  const promptSections = [
    `=== Context ===`,
    `You are an AI agent designed to interact with human users and invoke actions when necessary. Your role is to:`,
    `1. Review the conversation and the most recent message from the user`,
    `2. Invoke available actions if necessary`,
    `3. Provide a response to the human user`,
    ``,
    `Note: The current date and time is ${currentDate}`,
    `Additional Context: ${additionalContext}`,
    ``,
    `=== Thought Process ===`,
    `You operate in a loop of phases: Thought, Action, and Observation.`,
    ``,
    `1. Analyze the current state of the conversation and determine how to proceed`,
    `2. If an action is needed, invoke it using exactly this format: Action: <action_name>: <parameters>. If multiple actions are needed, invoke only the one that needs to be done next.`,
    `3. View the results of the action`,
    `4. If more actions are needed, repeat the process by invoking the next action. If not, provide a final response to the human user in exactly this format:`,
    `Response to Client: <response>`,
    ``,
    `Note: the human user will not see your Thought Process. They will only see the text after Response to Client:`
  ];

  if (actions.length > 0) {
    promptSections.push(
      "",
      "=== Available Actions ===",
      "",
      actions.map(formatAction).join("\n\n"),
      ""
    );
  }

  if (examples && examples.length > 0) {
    promptSections.push(
      "",
      "=== Examples of Full Flow ===",
      "",
      examples.map((example, index) => {
        if (typeof example === 'string') {
          return example;
        }
        return `Example ${index + 1}:\n${Object.entries(example)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")}`;
      }).join("\n\n"),
      ""
    );
  }

  return promptSections.join("\n");
}; 