'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { loginUser, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const pathName =
        user?.role === 'admin' ? '/dashboard' : '/profile/' + user?.id;
      setTimeout(() => {
        router.push(pathName);
      });
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      const result = await loginUser(username, password).unwrap();
      setMessage(result.message || 'Login successful');
      if (result.success) {
        setIsError(false);
      } else {
        setIsError(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setIsError(true);
      setMessage(errorMessage);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement | HTMLFormElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden h-full flex-col items-center justify-center bg-[#7b1f1f] p-12 lg:flex lg:w-1/2">
        <div className="mb-0">
          <Image
            src="/NewLogoStudent.png"
            alt="New Student Logo"
            width={280}
            height={280}
            className="h-72 w-72 object-contain"
          />
        </div>
        <h1 className="mb-2 text-center text-4xl font-bold text-white">
          Graduated Learning
        </h1>
        <h2 className="mb-4 text-center text-3xl font-bold text-white">
          Progress Tracking
        </h2>
      </div>
      <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4 py-8 sm:p-8 lg:w-1/2">
        <form
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-10 md:max-w-lg md:p-12 lg:max-w-2xl lg:p-16"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          onKeyDown={handleKeyDown}
        >
          <div className="mb-6 flex justify-center sm:mb-8 lg:mb-10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#7b1f1f] sm:h-32 sm:w-32 lg:h-40 lg:w-40 lg:border-[5px]">
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14 text-[#7b1f1f] sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                fill="currentColor"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14c-6 0-8 3-8 6v1h16v-1c0-3-2-6-8-6z" />
              </svg>
            </div>
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold text-[#7b1f1f] sm:mb-8 sm:text-3xl lg:mb-12 lg:text-4xl">
            Login to Your Account
          </h2>
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center rounded-full border-2 border-gray-300 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
              <svg
                className="mr-3 h-5 w-5 text-gray-400 sm:mr-4 sm:h-6 sm:w-6 lg:mr-5 lg:h-7 lg:w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-base text-gray-600 placeholder-gray-400 outline-none sm:text-lg lg:text-xl"
              />
            </div>
          </div>
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="flex items-center rounded-full border-2 border-gray-300 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
              <svg
                className="mr-3 h-5 w-5 text-gray-400 sm:mr-4 sm:h-6 sm:w-6 lg:mr-5 lg:h-7 lg:w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-base text-gray-600 placeholder-gray-400 outline-none sm:text-lg lg:text-xl"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[#7b1f1f] px-6 py-3 text-base font-bold tracking-wider text-white transition-colors duration-300 hover:bg-[#5c1717] sm:px-8 sm:py-4 sm:text-lg lg:px-10 lg:py-5 lg:text-xl"
          >
            Login
          </button>
          {message && (
            <p
              className={`mt-4 text-center text-sm sm:mt-6 sm:text-base lg:mt-8 lg:text-lg ${isError ? 'text-red-500' : 'text-green-500'}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
