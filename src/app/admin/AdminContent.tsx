'use client';

import { useState } from 'react';

export default function AdminContent() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setIsLoggedIn(true); 
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded shadow-md max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6">Admin</h1>
        <p className="text-lg text-gray-700 mb-4">
          Welcome
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Larom
        </p>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
        >
          Logout
        </button>
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-8 bg-white rounded shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="flex justify-center items-center">
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Login
      </button>
      <a
        type="button"
        href='/'
        className="w-full px-4 py-2 text-center m-2 my-10 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back
      </a>
      </div>
    </form>
  );
}