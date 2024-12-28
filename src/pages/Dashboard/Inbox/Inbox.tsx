import React, { useState, useEffect, useMemo } from 'react';
import { PenSquare } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { inboxService } from '../../../services/inboxService';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import ComposeDialog from '../../../components/Inbox/ComposeDialog';
import InboxStats from '../../../components/Inbox/InboxStats';
import MessagePreview from '../../../components/Inbox/MessagePreview';
import MessageView from '../../../components/Inbox/MessageView';
import MessageFilters from '../../../components/Inbox/MessageFilters';
import type { Message } from '../../../types/inbox';

const MAX_CAPACITY = 100;

export default function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const user = useAuthStore(state => state.user);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const data = await inboxService.getMessages(user.id);
      setMessages(data);
    } catch (error) {
      showToast('Erreur lors du chargement des messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        msg =>
          msg.subject.toLowerCase().includes(term) ||
          msg.content.toLowerCase().includes(term) ||
          msg.sender.username.toLowerCase().includes(term) ||
          msg.recipient.username.toLowerCase().includes(term)
      );
    }

    // Apply read/unread filter
    if (filter === 'unread') {
      result = result.filter(msg => !msg.read_at);
    } else if (filter === 'read') {
      result = result.filter(msg => msg.read_at);
    }

    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [messages, searchTerm, sortOrder, filter]);

  const handleSendMessage = async (data: { recipient: string; subject: string; content: string }) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await inboxService.sendMessage({
        userId: user.id,
        recipient: data.recipient,
        subject: data.subject,
        content: data.content
      });
      await loadMessages();
      setShowCompose(false);
      showToast('Message envoyé avec succès', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await inboxService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      showToast('Message supprimé', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await inboxService.deleteAllMessages(user!.id);
      setMessages([]);
      setSelectedMessage(null);
      setShowDeleteConfirm(false);
      showToast('Tous les messages ont été supprimés', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read_at) {
      try {
        await inboxService.markAsRead(message.id);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, read_at: new Date().toISOString() }
              : msg
          )
        );
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleReply = (message: Message) => {
    setShowCompose(true);
    // TODO: Implement reply logic
  };

  const handleForward = (message: Message) => {
    setShowCompose(true);
    // TODO: Implement forward logic
  };

  const unreadCount = messages.filter(msg => !msg.read_at).length;
  const capacityPercentage = Math.round((messages.length / MAX_CAPACITY) * 100);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Boîte de réception</h1>
        <div className="glass p-6 rounded-lg flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Boîte de réception</h1>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
        >
          <PenSquare className="w-4 h-4" />
          Nouveau message
        </button>
      </div>

      <InboxStats
        totalMessages={messages.length}
        unreadCount={unreadCount}
        capacityPercentage={capacityPercentage}
        onDeleteAll={() => setShowDeleteConfirm(true)}
      />

      <MessageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {filteredMessages.map(message => (
            <MessagePreview
              key={message.id}
              message={message}
              onSelect={handleSelectMessage}
              onDelete={handleDeleteMessage}
              isSelected={selectedMessage?.id === message.id}
            />
          ))}
        </div>

        {selectedMessage && (
          <MessageView
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onDelete={handleDeleteMessage}
            onReply={handleReply}
            onForward={handleForward}
          />
        )}
      </div>

      <ComposeDialog
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSendMessage}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAll}
        title="Supprimer tous les messages"
        message="Êtes-vous sûr de vouloir supprimer tous les messages ? Cette action est irréversible."
      />
    </div>
  );
}