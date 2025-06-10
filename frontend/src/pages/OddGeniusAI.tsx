import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  Flex,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiSend, FiMessageCircle, FiUser, FiCpu } from 'react-icons/fi';

// Import with try-catch for safety
let chatService: any;
try {
  chatService = require('../services/chatService').chatService;
} catch {
  console.warn('ChatService not available');
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const OddGeniusAI: React.FC = () => {
  // Add spinner animation CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "⚽ Welcome to Odd Genius AI!\n\nI'm your soccer analytics assistant with real-time data access.\n\nI can help you with:\n• Live match analysis and scores\n• Upcoming fixture predictions\n• Team performance insights\n• Betting value opportunities\n• League statistics and trends\n\nWhat would you like to know about today's soccer action?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Simple color scheme
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userMessageBg = useColorModeValue('blue.500', 'blue.600');
  const botMessageBg = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      let response: string;
      if (chatService && chatService.sendMessage) {
        response = await chatService.sendMessage(inputValue.trim());
      } else {
        // Fallback response when service is not available
        response = "I'm ready to help with soccer analytics! However, the backend service is currently not available. Please check your connection and try again.";
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };  return (
    <div 
      style={{
        backgroundColor: useColorModeValue('#f7fafc', '#1a202c'),
        minHeight: '100vh',
        padding: '2rem'
      }}
    >
      <div 
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        
        {/* Simple Header with Logo */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem'
          }}
        >
          <div 
            style={{
              padding: '12px',
              backgroundColor: '#3182ce',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiMessageCircle size={32} />
          </div>
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#3182ce',
              margin: 0
            }}
          >
            Odd Genius AI
          </h1>
        </div>

        {/* Clean Chat Interface */}
        <div 
          style={{
            flex: 1,
            backgroundColor: useColorModeValue('white', '#2d3748'),
            borderRadius: '8px',
            border: `1px solid ${useColorModeValue('#e2e8f0', '#4a5568')}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          
          {/* Messages Container */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  {!message.isUser && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#3182ce',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiCpu size={16} />
                    </div>
                  )}
                  <div style={{ maxWidth: '70%' }}>
                    <div
                      style={{
                        backgroundColor: message.isUser 
                          ? useColorModeValue('#3182ce', '#4299e1')
                          : useColorModeValue('#f7fafc', '#4a5568'),
                        color: message.isUser ? 'white' : 'inherit',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        borderBottomRightRadius: message.isUser ? '4px' : '8px',
                        borderBottomLeftRadius: message.isUser ? '8px' : '4px'
                      }}
                    >
                      <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#718096',
                        marginTop: '4px',
                        textAlign: message.isUser ? 'right' : 'left'
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  {message.isUser && (
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#718096',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiUser size={16} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#3182ce',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiCpu size={16} />
                  </div>
                  <div
                    style={{
                      backgroundColor: useColorModeValue('#f7fafc', '#4a5568'),
                      padding: '12px 16px',
                      borderRadius: '8px',
                      borderBottomLeftRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div 
                      style={{
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #e2e8f0',
                        borderTop: '2px solid #3182ce',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      Analyzing soccer data...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div 
            style={{
              padding: '1rem',
              borderTop: `1px solid ${useColorModeValue('#e2e8f0', '#4a5568')}`,
              backgroundColor: useColorModeValue('white', '#2d3748')
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about live matches, team analysis, or betting opportunities..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${useColorModeValue('#e2e8f0', '#4a5568')}`,
                  backgroundColor: useColorModeValue('white', '#4a5568'),
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  fontSize: '14px',
                  cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                  opacity: !inputValue.trim() || isLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiSend size={14} />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div 
            style={{
              padding: '12px',
              backgroundColor: '#fed7d7',
              color: '#c53030',
              borderRadius: '6px',
              border: '1px solid #feb2b2',
              fontSize: '14px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default OddGeniusAI;
