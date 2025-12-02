'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      const res = await authService.validateToken();
      if (res.success) {
        router.push('/');
      }
    };
    validateToken();
  });

  const handleSignup = async () => {
    const res = await authService.signup({
      email,
      password,
      phone: '',
      displayName: '',
      role: 'student',
    });
    if (res?.success) {
      setMessage('Signup successful');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      setMessage(`Signup failed: ${res?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md">
      <h1>Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 block w-full border p-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 block w-full border p-2"
      />
      <button onClick={handleSignup} className="bg-blue-500 p-2 text-white">
        Sign Up
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
