import { 
  AgentConfig, 
  AgentState, 
  Message, 
  Action, 
  AgentResponse,
  Role,
  ContentType,
  ModelProvider
} from '../types/agent_types';
import { createOpenAIProvider, createAnthropicProvider } from '../services/modelProviders';

// Regex for matching action patterns in responses
const ACTION_REGEX = /^Action: (\w+): (.*)$/;

/**
 * Creates a new agent state from the provided configuration
 */
export const createAgent = async (config: AgentConfig): Promise<AgentState> => {
  const {
    actions,
    provider = "openai",
    model = "gpt-4o",
    temperature = 1.0,
    maxTurns = 3
  } = config;

  // Convert actions array to record for easier lookup
  const actionsMap = actions.reduce((acc, action) => {
    acc[action.name] = action;
    return acc;
  }, {} as Record<string, Action>);

  // Initialize messages with system prompt if provided
  const messages: Message[] = [];
  if (config.additionalContext) {
    messages.push({
      role: "system" as Role,
      content: config.additionalContext,
      type: "text" as ContentType
    });
  }

  return {
    modelProvider: await getModelProvider(provider, model),
    temperature,
    actions: actionsMap,
    messages,
    maxTurns
  };
};

/**
 * Adds a message or messages to the agent's state
 */
export const addMessage = (
  state: AgentState, 
  message: Message | Message[] | string
): AgentState => {
  const newMessages: Message[] = Array.isArray(message) 
    ? message 
    : typeof message === 'string'
      ? [{ role: "user" as Role, content: message, type: "text" as ContentType }]
      : [message];

  return {
    ...state,
    messages: [...state.messages, ...newMessages]
  };
};

/**
 * Executes a single turn of conversation with the model
 */
export const execute = async (state: AgentState): Promise<string> => {
  return state.modelProvider.generateResponse(state.messages, state.temperature);
};

/**
 * Processes any actions in the model's response
 */
export const processActions = (
  state: AgentState, 
  result: string
): [string | null, string | null] => {
  const actions = result
    .split('\n')
    .map(line => ACTION_REGEX.exec(line))
    .filter((match): match is RegExpExecArray => match !== null);

  if (actions.length === 0) {
    // Extract response part (everything after last Observation)
    const responseLines = result.split('\n');
    let responseStart = 0;
    for (let i = 0; i < responseLines.length; i++) {
      if (responseLines[i].toLowerCase().startsWith('observation:')) {
        responseStart = i + 1;
      }
    }
    const response = responseLines.slice(responseStart).join('\n').trim();
    return [response, null];
  }

  const [actionName, actionInput] = actions[0].slice(1);
  
  if (!state.actions[actionName]) {
    const errorMsg = `Unknown action: ${actionName}. Available actions: ${Object.keys(state.actions).join(', ')}`;
    return [errorMsg, null];
  }

  try {
    const action = state.actions[actionName];
    const observation = action.handler(actionInput);
    return [null, `Observation: ${observation}`];
  } catch (error) {
    const errorMsg = `Error executing ${actionName}: ${error instanceof Error ? error.message : String(error)}`;
    return [errorMsg, null];
  }
};

/**
 * Main query function that processes messages through the agent
 */
export const query = async (
  state: AgentState,
  messages: Message[],
): Promise<AgentResponse> => {
  try {
    // Add new messages to state
    const updatedState = addMessage(state, messages);

    for (let turn = 0; turn < updatedState.maxTurns; turn++) {
      const result = await execute(updatedState);
      
      // Add assistant's response to messages
      const stateWithResponse = addMessage(updatedState, {
        role: "assistant" as Role,
        content: result,
        type: "text" as ContentType
      });

      const [response, observation] = processActions(stateWithResponse, result);
      
      if (response !== null) {
        return [response, null];
      }

      if (observation !== null) {
        updatedState.messages.push({
          role: "system" as Role,
          content: observation,
          type: "text" as ContentType
        });
      } else {
        break;
      }
    }

    return ["Max turns reached without final response", null];
  } catch (error) {
    const errorMsg = `Error in agent loop: ${error instanceof Error ? error.message : String(error)}`;
    return [errorMsg, null];
  }
};

/**
 * Helper function to get the appropriate model provider
 */
export async function getModelProvider(provider: string, model: string): Promise<ModelProvider> {
  switch (provider.toLowerCase()) {
    case 'openai':
      return await createOpenAIProvider(model);
    case 'anthropic':
      return await createAnthropicProvider(model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
