'use client';

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { RegisteredUser } from '../../lib/types';

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export default function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data as RegisteredUser[]);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
      onClick={onClose}
    >
      <div
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        className='w-full max-w-sm rounded-2xl border p-4'
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
      >
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold'>Chat baru</h2>
          <button onClick={onClose} className='text-xs' style={{ color: 'var(--text-secondary)' }}>
            Tutup
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Cari nama atau email'
          className='mb-3 w-full rounded-full border bg-transparent px-3 py-1.5 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <div className='mb-3 max-h-64 space-y-1 overflow-y-auto'>
          {loading && (
            <p className='py-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
              Memuat pengguna...
            </p>
          )}
          {!loading && filtered.length === 0 && (
            <p className='py-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
              Tidak ada pengguna terdaftar yang cocok.
            </p>
          )}
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className='flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left'
              style={{ backgroundColor: selected === u.id ? 'var(--bg-panel)' : 'transparent' }}
            >
              <div
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold'
                style={{
                  backgroundColor: 'var(--bubble-other)',
                  color: 'var(--bubble-other-text)',
                }}
              >
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{u.name}</p>
                <p className='truncate text-xs' style={{ color: 'var(--text-secondary)' }}>
                  {u.email}
                </p>
              </div>
              <span
                className='h-4 w-4 shrink-0 rounded-full border'
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: selected === u.id ? 'var(--text)' : 'transparent',
                }}
              />
            </button>
          ))}
        </div>

        <button
          disabled={!selected}
          onClick={() => selected && onStartChat(selected)}
          className='w-full rounded-lg py-2 text-sm font-semibold disabled:opacity-50'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          Mulai chat
        </button>
      </div>
    </div>
  );
}
