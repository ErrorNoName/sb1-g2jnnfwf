import React from 'react';

interface DiscordIdInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function DiscordIdInput({ value, onChange, error }: DiscordIdInputProps) {
  return (
    <div>
      <label htmlFor="discordId" className="block text-sm font-medium text-gray-300 mb-1">
        ID Discord
      </label>
      <input
        type="text"
        id="discordId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Exemple: User#1234"
        pattern="^.+#[0-9]{4}$"
        className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}