import React from 'react';
import { MessageSquare } from 'lucide-react';

interface DiscordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function DiscordInput({ value, onChange, error }: DiscordInputProps) {
  return (
    <div>
      <label htmlFor="discordId" className="block text-sm font-medium text-gray-300 mb-1">
        Pseudo Discord
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MessageSquare className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="discordId"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Votre pseudo Discord"
          className="w-full pl-10 bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}