'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ChatMessage, ConversationSummary } from '../../lib/types';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

interface ChatWindowProps {
  conversation: ConversationSummary | null;
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (text: string) => void;
  onBack: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSend,
  onBack,
}: ChatWindowProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  }

  if (!conversation) {
    return (
      <section className='flex flex-1 items-center justify-center px-4 text-center'>
        <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
          Pilih percakapan atau mulai chat baru
        </p>
      </section>
    );
  }

  return (
    <section className='flex flex-1 flex-col'>
      <div
        className='flex items-center gap-3 border-b px-4 py-3'
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Tombol kembali hanya muncul di layar kecil (mobile), supaya bisa balik ke daftar chat. */}
        <button
          onClick={onBack}
          className='-ml-1 mr-1 rounded-full p-1 text-lg sm:hidden'
          aria-label='Kembali ke daftar chat'
        >
          ←
        </button>

        <div className='relative shrink-0'>
          <div
            className='flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold'
            style={{ backgroundColor: 'var(--bubble-other)', color: 'var(--bubble-other-text)' }}
          >
            {conversation.other?.name?.slice(0, 2).toUpperCase()}
          </div>
          {conversation.other?.isOnline && (
            <span
              className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2'
              style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg)' }}
            />
          )}
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{conversation.other?.name}</p>
          <p className='truncate text-xs' style={{ color: 'var(--text-secondary)' }}>
            {conversation.other?.isOnline ? 'Online' : conversation.other?.email}
          </p>
        </div>
      </div>

      <div className='flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4'>
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className='max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%]'
                style={{
                  backgroundColor: mine ? 'var(--bubble-me)' : 'var(--bubble-other)',
                  color: mine ? 'var(--bubble-me-text)' : 'var(--bubble-other-text)',
                }}
              >
                <p className='whitespace-pre-wrap wrap-break-word'>{m.text}</p>
                <p className='mt-1 text-right text-[10px] opacity-70'>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className='flex items-center gap-2 border-t p-2 sm:p-3'
        style={{ borderColor: 'var(--border)' }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Tulis pesan'
          className='flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />
        <button
          type='submit'
          className='shrink-0 rounded-full px-4 py-2 text-sm font-semibold'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          Kirim
        </button>
      </form>
    </section>
  );
}
