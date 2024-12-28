import React, { useState } from 'react';
import { RULES } from '../constants/rules';
import type { ReportData } from '../types/report';
import FileUploadZone from './FileUpload/FileUploadZone';
import FilePreview from './FileUpload/FilePreview';
import { AlertTriangle, Ban, VolumeX } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (data: ReportData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData(e.currentTarget);
    
    await onSubmit({
      username: formData.get('username') as string,
      proof: selectedFile,
      rules: Array.from(formData.getAll('rules')).map(Number),
      warnings: Number(formData.get('warnings')),
      kicks: Number(formData.get('kicks')),
      mutes: Number(formData.get('mutes'))
    });
  };

  const handleRuleToggle = (ruleId: number) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-lg space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="Entrez le nom d'utilisateur"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preuve (image ou vidéo)
          </label>
          {selectedFile ? (
            <div className="relative">
              <FilePreview
                file={selectedFile}
                onRemove={() => setSelectedFile(null)}
              />
            </div>
          ) : (
            <FileUploadZone
              onFileSelect={setSelectedFile}
              accept="image/*,video/*"
              maxSize={10 * 1024 * 1024}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Règles enfreintes
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(RULES).map(([id, rule]) => (
              <label
                key={id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRules.includes(Number(id))
                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                    : 'bg-gray-800/50 hover:bg-gray-800/70'
                }`}
              >
                <input
                  type="checkbox"
                  name="rules"
                  value={id}
                  checked={selectedRules.includes(Number(id))}
                  onChange={() => handleRuleToggle(Number(id))}
                  className="sr-only"
                />
                <span className="text-sm">{rule}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
              <AlertTriangle size={16} className="text-yellow-500" />
              Avertissements
            </label>
            <input
              type="number"
              name="warnings"
              min="0"
              defaultValue="0"
              className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
              <Ban size={16} className="text-red-500" />
              Expulsions
            </label>
            <input
              type="number"
              name="kicks"
              min="0"
              defaultValue="0"
              className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
              <VolumeX size={16} className="text-orange-500" />
              Mutes
            </label>
            <input
              type="number"
              name="mutes"
              min="0"
              defaultValue="0"
              className="w-full bg-gray-800/50 rounded-lg border-0 p-3 text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className={`px-4 py-2 rounded-lg font-medium ${
            isSubmitting || !selectedFile
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le rapport'}
        </button>
      </div>
    </form>
  );
}