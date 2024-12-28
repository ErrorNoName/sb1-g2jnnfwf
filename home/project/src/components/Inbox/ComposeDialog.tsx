import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../hooks/useToast';
import UserSearch from './UserSearch';
import { inboxService } from '../../services/inboxService';
import type { Profile } from '../../types/inbox';

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onSend: (data: { recipient: string; subject: string; content: string }) => Promise<void>;
}

export default function ComposeDialog({ isOpen, onClose, onSend, isSubmitting = false }: ComposeDialogProps) {
  const [recipient, setRecipient] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();

  const searchProfiles = useCallback(async (query: string) => {
    if (!user || query.length < 2) {
      setProfiles([]);
      setShowDropdown(false);
      return;
    }

    try {
      const results = await inboxService.searchProfiles(query, user.id);
      setProfiles(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching profiles:', error);
      setProfiles([]);
      setShowDropdown(false);
    }
  }, [user]);

  useEffect(() => {
    const query = recipient.trim();
    const debounceTimer = setTimeout(() => searchProfiles(query), 300);
    return () => clearTimeout(debounceTimer);
  }, [recipient, searchProfiles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !content.trim()) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    try {
      await onSend({ recipient, subject, content });
      setRecipient('');
      setSubject('');
      setContent('');
      setShowDropdown(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de l\'envoi', 'error');
    }
  };

  const handleSelectProfile = (username: string) => {
    setRecipient(username);
    setShowDropdown(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative w-full max-w-2xl m-4 p-6 rounded-lg animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Nouveau message</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800/50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

          </div>
          <input
              type="text"
            placeholder="Objet"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            placeholder="Votre message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !recipient || !subject || !content}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}