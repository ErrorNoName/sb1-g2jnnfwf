import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RULES } from '../../constants/rules';
import ReportForm from '../../components/ReportForm';
import ServerStatusIndicator from '../../components/ServerStatus/ServerStatusIndicator';
import type { ReportData } from '../../types/report';
import { supabase, uploadProof } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321292567769255936/JHe0_k0uEa6XExO6TTBlCuvMYDYNs7xlr_GFCWIyJiZkDCiLdhw_uoKm59A5VDh7HOJO';

export default function NewReport() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ReportData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload the proof file
      const proofUrl = await uploadProof(data.proof);

      // Get a signed URL for Discord (valid for 1 hour)
      const filePath = proofUrl.split('/').slice(-2).join('/');
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('reports')
        .createSignedUrl(filePath, 3600);

      if (signedUrlError) throw signedUrlError;

      // Insert the report in the database
      const { error: dbError } = await supabase
        .from('reports')
        .insert({
          username: data.username,
          proof_url: proofUrl,
          rules: data.rules,
          warnings: data.warnings,
          kicks: data.kicks,
          mutes: data.mutes,
          reported_by: user?.id
        });

      if (dbError) throw dbError;

      // Send Discord notification with signed URL
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'Nouveau rapport utilisateur',
            color: 0x5865F2,
            fields: [
              {
                name: 'Pseudo',
                value: data.username,
                inline: true
              },
              {
                name: 'Infractions',
                value: data.rules.map(rule => RULES[rule]).join('\n'),
                inline: false
              },
              {
                name: 'Actions passées',
                value: [
                  `Warns : ${data.warnings}`,
                  `Kicks : ${data.kicks}`,
                  `Mutes : ${data.mutes}`
                ].join('\n'),
                inline: false
              },
              {
                name: 'Rapporté par',
                value: user?.username || 'Inconnu',
                inline: true
              }
            ],
            image: {
              url: signedUrlData.signedUrl
            },
            timestamp: new Date().toISOString()
          }]
        })
      });

      showToast('Rapport créé avec succès', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nouveau rapport</h1>
        <ServerStatusIndicator />
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
      <ReportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}