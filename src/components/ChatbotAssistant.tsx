import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './ChatbotAssistant.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant pour la rédaction de rapports. Comment puis-je vous aider ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `J'ai bien reçu : "${input}". Cette fonctionnalité sera connectée à une API réelle dans la version finale.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">Assistant Rédaction</h2>
      
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`chatbot-message chatbot-message-${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            <div className="chatbot-message-content">
              <p>{message.text}</p>
              <span className="chatbot-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Posez votre question..."
          className="chatbot-input"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="chatbot-send-button"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}