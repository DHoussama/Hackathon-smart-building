
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'bot',
        text: 'Hello! I am the USZ Assistant. I can help you with visiting hours, parking info, or finding departments. How can I help you today?',
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await getChatResponse(userMsg.text);
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error("Chat Error", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 z-10">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-usz-blue to-blue-400 flex items-center justify-center text-white shadow-md">
                <Bot size={24} />
            </div>
            <div>
                <h1 className="font-bold text-gray-900">USZ Assistant</h1>
                <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    <span className="text-xs text-gray-500 font-medium">Online</span>
                </div>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
            const isBot = msg.role === 'bot';
            return (
                <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        isBot 
                        ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                        : 'bg-usz-blue text-white rounded-tr-none'
                    }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={`text-[10px] mt-1 block opacity-60 ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            );
        })}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-gray-100 flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-usz-blue" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white p-3 border-t border-gray-200 flex items-center space-x-2">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about visiting hours, parking..."
            className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-usz-blue focus:bg-white transition-all"
        />
        <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-usz-blue text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-blue-800 transition-colors"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
