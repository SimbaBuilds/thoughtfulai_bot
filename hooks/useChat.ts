'use client';

import { useState } from 'react';
import { sendChatMessage } from '../lib/services/chat';
import { Message } from '../lib/types/agent_types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    console.log('[Chat] User submitted message:', userMessage);
    setInput('');
    setIsLoading(true);

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      type: 'text'
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      console.log('[Chat] Sending request to agent');
      const data = await sendChatMessage(updatedMessages);
      setMessages(messages => [...messages, { 
        role: 'assistant',
        content: data.response,
        type: 'text'
      }]);
    } catch (error) {
      console.error('[Chat] Error processing request:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
      console.log('[Chat] Request processing completed');
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage
  };
}
