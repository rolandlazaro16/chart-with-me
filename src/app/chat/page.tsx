'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, LogOut, MessageSquare, ChevronDown, User as UserIcon } from 'lucide-react';

interface User {
  _id: string;
  username: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
      const interval = setInterval(() => {
        fetchMessages(selectedUser);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage;
    setNewMessage(''); // optimistic clear
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedUser, content }),
      });
      if (res.ok) {
        fetchMessages(selectedUser);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const selectedUserData = users.find(u => u._id === selectedUser);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">CHAT <span className="text-purple-400">WITH ME</span></h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
          >
            <LogOut w-4 h-4 />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid md:grid-cols-[300px_1fr] gap-6">
        
        {/* Sidebar / Member Selection */}
        <aside className="flex flex-col space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md h-full min-h-[400px] flex flex-col shadow-xl">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Select Member</h2>
            
            {loadingUsers ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center mt-4">No other members found.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user._id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                      selectedUser === user._id 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-purple-500/30' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      selectedUser === user._id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-800 text-gray-400 group-hover:text-white'
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-medium ${selectedUser === user._id ? 'text-white' : 'text-gray-300'}`}>
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-black/20 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUserData?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedUserData?.username}</h3>
                  <span className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>Online</span>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>No messages yet.</p>
                    <p className="text-sm">Start the conversation with {selectedUserData?.username}!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId !== selectedUser;
                    return (
                      <div key={msg._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                          isMine 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm' 
                            : 'bg-[#1a1a24] text-gray-100 border border-white/5 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1.5 text-right ${isMine ? 'text-indigo-200' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-black/20 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 flex items-center justify-center transition-colors shadow-lg shadow-purple-500/25"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <UserIcon className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">Your Messages</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Select a member from the list to start chatting with them.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Global styles for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
