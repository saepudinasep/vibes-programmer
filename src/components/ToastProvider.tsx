'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ToastTone = 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  function dismissToast() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setToast(null);
  }

  function showToast(message: string, tone: ToastTone = 'success') {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id: ++nextIdRef.current, message, tone });
    timeoutRef.current = setTimeout(dismissToast, 4500);
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
          className='fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg'
          style={{
            borderColor: toast.tone === 'error' ? '#dc2626' : '#16a34a',
            backgroundColor: 'var(--bg-panel)',
            color: 'var(--text)',
          }}
        >
          <span className='flex-1'>{toast.message}</span>
          <button
            type='button'
            onClick={dismissToast}
            aria-label='Tutup notifikasi'
            className='-mt-1 text-lg leading-none'
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast harus digunakan di dalam ToastProvider');
  return context;
}
