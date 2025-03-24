'use client';

import { useChat } from '../hooks/useChat';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export default function Chat() {
  const { messages, input, setInput, isLoading, sendMessage } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <Card className="flex flex-col h-[700px] w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-slate-600 to-slate-700 text-white pt-6">
        <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Thoughtful AI Support
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p className="text-lg mb-2">Welcome to Thoughtful AI Support!</p>
              <p className="text-sm">I can help you with questions about:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Eligibility Verification Agent (EVA)</li>
                <li>• Claims Processing Agent (CAM)</li>
                <li>• Payment Posting Agent (PHIL)</li>
                <li>• Benefits of using Thoughtful AI</li>
                <li>• General information about our agents</li>
              </ul>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-slate-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="prose dark:prose-invert max-w-none">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-slate-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.role === 'user' ? 'You' : 'Thoughtful AI Support'}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Thoughtful AI's agents..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
            >
              <span>Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
