import { useState } from 'react';
import { User, Search } from 'lucide-react';
import type { ChatMessage, ChatUser, ChatAttachment } from '../types/chat';
import ChatMessage from '../components/Chat/ChatMessage';
import ChatInput from '../components/Chat/ChatInput';

const DEMO_USERS: ChatUser[] = [
  {
    id: '1',
    name: 'Thomas Martin',
    role: 'technician',
    status: 'online'
  },
  {
    id: '2',
    name: 'Sophie Bernard',
    role: 'admin',
    status: 'online'
  }
];

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | undefined>();
  const currentUser: ChatUser = {
    id: 'current',
    name: 'Moi',
    role: 'user',
    status: 'online'
  };

  const handleSendMessage = (text: string, attachments: ChatAttachment[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: currentUser,
      timestamp: new Date(),
      attachments,
      replyTo: replyingTo,
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(undefined);

    // Simuler une réponse
    if (text.toLowerCase().includes('maintenance')) {
      setTimeout(() => {
        const technicianMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Je vais vous aider avec la maintenance. Pouvez-vous me donner plus de détails sur l'équipement concerné ?",
          sender: DEMO_USERS[0],
          timestamp: new Date(),
          isRead: false
        };
        setMessages(prev => [...prev, technicianMessage]);
      }, 1000);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex">
      {/* Liste des conversations */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {DEMO_USERS.map(user => (
            <button
              key={user.id}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  user.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-900">Chat</h2>
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              En ligne
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.sender.id === currentUser.id}
              onReply={(messageId) => setReplyingTo(messageId)}
            />
          ))}
        </div>

        <ChatInput
          onSend={handleSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(undefined)}
        />
      </div>
    </div>
  );
}