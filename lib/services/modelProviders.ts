'use server'
import { Message, ModelProvider } from '../types/agent_types';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export async function createOpenAIProvider(model: string): Promise<ModelProvider> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return {
    generateResponse: async (messages: Message[], temperature: number): Promise<string> => {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature
        });

        return response.choices[0]?.message?.content || '';
      } catch (error) {
        throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
};

export async function createAnthropicProvider(model: string): Promise<ModelProvider> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  return {
    generateResponse: async (messages: Message[], temperature: number): Promise<string> => {
      try {
        const response = await anthropic.messages.create({
          model,
          messages: messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.role === 'system' ? `System: ${msg.content}` : msg.content
          })),
          temperature,
          max_tokens: 4096
        });

        return response.content[0]?.type === 'text' ? response.content[0].text : '';
      } catch (error) {
        throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}; 