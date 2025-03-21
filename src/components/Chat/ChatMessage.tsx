import { useState } from 'react';
import { User, Download, ExternalLink, Reply, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onReply: (messageId: string) => void;
}

export default function ChatMessage({ message, isCurrentUser, onReply }: ChatMessageProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageClick = (url: string) => {
    setPreviewUrl(url);
    setShowImagePreview(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 rounded-full p-2 ${
        isCurrentUser ? 'bg-indigo-100' : 'bg-gray-100'
      }`}>
        {message.sender.avatar ? (
          <img
            src={message.sender.avatar}
            alt={message.sender.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-5 w-5 text-gray-600" />
        )}
      </div>

      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{message.sender.name}</span>
          <span className="text-xs text-gray-500">
            {format(message.timestamp, 'HH:mm', { locale: fr })}
          </span>
        </div>

        <div className={`mt-1 rounded-lg px-4 py-2 max-w-lg ${
          isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-2">
                  {attachment.type === 'image' ? (
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => handleImageClick(attachment.url)}
                    >
                      <img
                        src={attachment.thumbnailUrl || attachment.url}
                        alt={attachment.name}
                        className="max-w-xs rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity">
                        <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-center p-2 rounded-lg ${
                      isCurrentUser ? 'bg-indigo-700' : 'bg-white'
                    }`}>
                      <ImageIcon className="h-5 w-5 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                      </div>
                      <a
                        href={attachment.url}
                        download
                        className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center space-x-2">
          <button
            onClick={() => onReply(message.id)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
          >
            <Reply className="h-4 w-4 mr-1" />
            Répondre
          </button>
        </div>
      </div>

      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90%] max-h-[90vh] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}