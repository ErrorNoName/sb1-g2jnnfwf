import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import type { Profile } from '../../types/inbox';

interface UserSearchProps {
  onSelect: (username: string) => void;
  value: string;
  onChange: (value: string) => void;
  profiles: Profile[];
  showDropdown: boolean;
  onFocus?: () => void;
}

export default function UserSearch({ 
  onSelect, 
  value, 
  onChange, 
  profiles, 
  showDropdown,
  onFocus 
}: UserSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
      <input
        type="text"
        autoComplete="off"
        placeholder="Rechercher un utilisateur..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="w-full pl-10 bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
      />
      {showDropdown && profiles.length > 0 && (
        <div className="absolute w-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto z-50">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile.username)}
              className="w-full px-4 py-2 text-left hover:bg-gray-700/50 focus:outline-none focus:bg-gray-700/50 flex items-center gap-2"
            >
              <span className="flex-1">{profile.username}</span>
              {profile.email && (
                <span className="text-sm text-gray-400">{profile.email}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}