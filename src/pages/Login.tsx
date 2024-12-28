import React, { useState } from 'react';
import { Moon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-xl p-8 w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <Moon className="mx-auto h-12 w-12 text-indigo-400" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">PixelLunar</h2>
          <p className="mt-2 text-sm text-gray-400">
            Plateforme de modération
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="username" className="sr-only">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-lg border-0 bg-gray-800/50 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                placeholder="Nom d'utilisateur (sensible à la casse)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-lg border-0 bg-gray-800/50 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                placeholder="Mot de passe (sensible à la casse)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}