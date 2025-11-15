import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: number;
  title: string;
  content: string;
  posted_at: string;
}

interface MessageBoardProps {
  eventSlug: string;
}

export default function MessageBoard({ eventSlug }: MessageBoardProps) {
  // Mock messages - TODO: Fetch from API
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      title: 'Payment Method',
      content: 'All vendors must submit payment through Stripe by November 1st. Late payments will incur a 10% fee.',
      posted_at: '2025-11-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Run of Show',
      content: 'Setup begins at 6am. Market opens at 9am. Breakdown starts at 4pm. Please arrive on time.',
      posted_at: '2025-11-02T14:30:00Z',
    },
  ]);

  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({ title: '', content: '' });

  const handleCreateMessage = () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: Date.now(),
      title: newMessage.title,
      content: newMessage.content,
      posted_at: new Date().toISOString(),
    };

    setMessages([message, ...messages]);
    setNewMessage({ title: '', content: '' });
    setShowNewMessage(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Messages & Announcements</h2>
        <button
          onClick={() => setShowNewMessage(!showNewMessage)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* New Message Form */}
      {showNewMessage && (
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <h3 className="text-white font-medium mb-4">Create New Message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm mb-2">Title</label>
              <input
                type="text"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                placeholder="Message title..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm mb-2">Content</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Message content..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateMessage}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all"
              >
                Post Message
              </button>
              <button
                onClick={() => {
                  setShowNewMessage(false);
                  setNewMessage({ title: '', content: '' });
                }}
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <p>No messages yet. Create your first announcement!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="bg-[#1a1a2e] rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">{message.title}</h3>
                  <p className="text-white/70 text-sm mb-3">{message.content}</p>
                  <p className="text-white/40 text-xs">Posted {formatDate(message.posted_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
