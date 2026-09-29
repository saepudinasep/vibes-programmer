'use client';

import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import { ChatMessage, ChatUser, ConversationSummary } from '../../lib/types';

const POLL_INTERVAL_MS = 3000;
const PRESENCE_INTERVAL_MS = 15000; // kirim "saya online" tiap 15 detik

export default function ChatApp({ currentUser }: { currentUser: ChatUser }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data = await res.json();
      setConversations(data as ConversationSummary[]);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string | null) => {
    if (!conversationId) return;
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data as ChatMessage[]);
    }
  }, []);

  // Muat daftar chat sekali di awal, lalu polling berkala supaya pesan masuk tanpa perlu refresh manual (bonus).
  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadConversations(), 0);
    const interval = setInterval(loadConversations, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    const initialLoad = window.setTimeout(() => void loadMessages(activeId), 0);
    const interval = setInterval(() => loadMessages(activeId), POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [activeId, loadMessages]);

  // Heartbeat presence: beri tahu server "saya masih aktif" secara berkala (bonus: status online).
  useEffect(() => {
    const sendHeartbeat = () => fetch('/api/presence', { method: 'POST' });
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, PRESENCE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Tandai conversation yang sedang dibuka sebagai sudah dibaca (bonus: penanda belum dibaca).
  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/conversations/${activeId}/read`, { method: 'POST' }).then(() => {
      // Refresh daftar supaya badge unread hilang segera, tanpa menunggu polling berikutnya.
      loadConversations();
    });
  }, [activeId, loadConversations]);

  async function handleSend(text: string) {
    if (!activeId) return;
    const res = await fetch(`/api/conversations/${activeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const newMessage = (await res.json()) as ChatMessage;
      setMessages((prev) => [...prev, newMessage]);
      loadConversations();
    }
  }

  async function handleStartChat(otherUserId: string) {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otherUserId }),
    });
    if (res.ok) {
      const conversation = (await res.json()) as ConversationSummary;
      setShowNewChat(false);
      await loadConversations();
      setActiveId(conversation.id);
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const filteredConversations = conversations.filter((c) =>
    c.other?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className='flex h-screen flex-col'
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <header
        className='flex items-center justify-between border-b px-4 py-3'
        style={{ borderColor: 'var(--border)' }}
      >
        <Logo />
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <div className='flex items-center gap-2'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold'
              style={{ backgroundColor: 'var(--bubble-other)', color: 'var(--bubble-other-text)' }}
            >
              {currentUser.name?.slice(0, 2).toUpperCase()}
            </div>
            <span className='hidden text-sm font-medium sm:inline'>{currentUser.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className='rounded-lg border px-3 py-1.5 text-xs font-semibold'
            style={{ borderColor: 'var(--border)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Di layar kecil: tampilkan salah satu panel saja (list ATAU chat), bukan berdampingan.
          Di layar sm ke atas (>=640px): tampilkan dua-duanya berdampingan seperti biasa. */}
      <div className='flex flex-1 overflow-hidden'>
        <div className={`${activeId ? 'hidden' : 'flex'} w-full sm:flex sm:w-auto`}>
          <ChatList
            conversations={filteredConversations}
            activeId={activeId}
            onSelect={setActiveId}
            onNewChat={() => setShowNewChat(true)}
            search={search}
            onSearchChange={setSearch}
          />
        </div>
        <div className={`${activeId ? 'flex' : 'hidden'} flex-1 sm:flex`}>
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUser.id}
            onSend={handleSend}
            onBack={() => setActiveId(null)}
          />
        </div>
      </div>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} onStartChat={handleStartChat} />
      )}
    </div>
  );
}
