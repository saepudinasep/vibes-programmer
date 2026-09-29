'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SetupProfile() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    // Client side validation
    if (!name || !bio || !image) {
      toast('Please fill in all fields and select an avatar', {
        style: {
          background: '#9810fa',
          color: 'white',
        },
      });

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('avatar', image);

      await axios.post('/api/auth/setup-profile', formData);

      toast('Profile update successfully', {
        style: {
          background: '#9810fa',
          color: 'white',
        },
      });

      router.replace('/chat');
    } catch (error) {
      console.log(error);

      toast('Something went wrong', {
        style: {
          background: '#9810fa',
          color: 'white',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className='flex min-h-screen flex-col items-center justify-center gap-8 px-4'
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      <div className='absolute right-4 top-4'>
        <ThemeToggle />
      </div>

      <Logo size='lg' />

      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border p-6'
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-panel)',
        }}
      >
        <h1 className='mb-6 text-lg font-bold'>Setup Profile</h1>

        {/* Avatar Preview */}
        <div className='mb-6 flex justify-center'>
          {imagePreview && (
            <Image
              src={imagePreview}
              alt='Profile preview'
              width={128}
              height={128}
              className='h-32 w-32 rounded-full object-cover'
              unoptimized
            />
          )}
        </div>

        {/* Name */}
        <label className='mb-1 block text-sm font-medium'>Name</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type='text'
          required
          placeholder='Name'
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{
            borderColor: 'var(--border)',
          }}
        />

        {/* Bio */}
        <label className='mb-1 block text-sm font-medium'>Bio</label>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          placeholder='Tell something about yourself...'
          className='mb-3 w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{
            borderColor: 'var(--border)',
          }}
          rows={4}
        />

        {/* Picture */}
        <label className='mb-1 block text-sm font-medium'>Picture</label>

        <input
          onChange={handleImage}
          type='file'
          accept='image/*'
          required={!imagePreview}
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{
            borderColor: 'var(--border)',
          }}
        />

        {/* Submit */}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-60'
          style={{
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
          }}
        >
          {loading ? 'Memproses...' : 'Lanjutkan'}
        </button>
      </form>
    </main>
  );
}
