
"use client";
import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MessageSquare, Send, X } from 'lucide-react';
import { ChatMessageItem, type ChatMessage } from './chat-message-item';
import type { Language } from '../../contexts/language-context';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserUid?: string | null;
  onSendMessage: (text: string) => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  language: Language;
  roomId: string | null;
}

export function ChatPanel({ 
  isOpen, 
  onClose, 
  roomId, 
  messages, 
  currentUserUid,
  onSendMessage,
  translateUi,
  language = 'es'
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText) return;

    setNewMessage('');
    onSendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-card rounded-lg shadow-lg border border-gray-200 dark:border-border flex flex-col max-h-[400px] z-50">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-border flex justify-between items-center bg-gray-50 dark:bg-card-foreground/5 rounded-t-lg">
        <h3 className="font-semibold flex items-center text-gray-800 dark:text-foreground">
          <MessageSquare className="mr-2 h-4 w-4" /> 
          {translateUi('chat.title')}
        </h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground transition-colors"
          aria-label={translateUi('chat.closeLabel')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-muted-foreground text-sm py-4">
            {translateUi('chat.noMessages')}
          </p>
        ) : (
          messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              currentUserUid={currentUserUid}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-border flex bg-gray-50 dark:bg-card-foreground/5 rounded-b-lg">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={translateUi('chat.placeholder')}
          onKeyDown={handleKeyPress}
          className="flex-1 mr-2"
          aria-label={translateUi('chat.inputLabel')}
        />
        <Button 
          onClick={handleSendMessage} 
          size="sm" 
          disabled={!newMessage.trim()}
          aria-label={translateUi('chat.sendMessage')}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
