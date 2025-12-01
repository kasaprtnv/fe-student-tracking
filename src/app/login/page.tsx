'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
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

  const handleLogin = async () => {
    const res = await authService.login(email, password);
    if (res?.success) {
      setMessage('Login successful!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setMessage(`Login failed: ${res?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md">
      <h1>Login</h1>
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
      <button
        onClick={handleLogin}
        className="cursor-pointer bg-green-500 p-2 text-white"
      >
        Login
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
