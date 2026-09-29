'use client';

import { ConversationSummary } from '../../lib/types';

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

interface ChatListProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function ChatList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  search,
  onSearchChange,
}: ChatListProps) {
  return (
    <aside
      className='flex w-full flex-col border-r sm:max-w-sm'
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
    >
      <div className='flex items-center gap-2 p-3'>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='Cari chat'
          className='flex-1 rounded-full border bg-transparent px-3 py-1.5 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />
        <button
          onClick={onNewChat}
          className='whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          + Chat baru
        </button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {conversations.length === 0 && (
          <p className='p-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
            Belum ada percakapan. Mulai chat baru.
          </p>
        )}

        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className='flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors'
            style={{
              borderColor: 'var(--border)',
              backgroundColor: c.id === activeId ? 'var(--bg)' : 'transparent',
            }}
          >
            <div className='relative shrink-0'>
              <div
                className='flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold'
                style={{
                  backgroundColor: 'var(--bubble-other)',
                  color: 'var(--bubble-other-text)',
                }}
              >
                {c.other?.name?.slice(0, 2).toUpperCase() || '?'}
              </div>
              {c.other?.isOnline && (
                <span
                  className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2'
                  style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg-panel)' }}
                  title='Online'
                />
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between'>
                <span className='truncate text-sm font-semibold'>
                  {c.other?.name || 'Pengguna'}
                </span>
                <span
                  className='ml-2 shrink-0 text-[11px]'
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {formatTime(c.lastMessageAt)}
                </span>
              </div>
              <div className='flex items-center justify-between gap-2'>
                <p
                  className='truncate text-xs'
                  style={{
                    color: c.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)',
                    fontWeight: c.unreadCount > 0 ? 600 : 400,
                  }}
                >
                  {c.lastMessage || 'Belum ada pesan'}
                </p>
                {c.unreadCount > 0 && (
                  <span
                    className='flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold'
                    style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
                  >
                    {c.unreadCount > 9 ? '9+' : c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
