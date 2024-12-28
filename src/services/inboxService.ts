import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type { Message, Profile } from '../types/inbox';

class InboxService {
  async getProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .order('username');

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch profiles:', error);
      throw error;
    }
  }

  async searchProfiles(query: string, currentUserId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_recipients', {
          search_term: query,
          current_user_id: currentUserId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to search profiles:', error);
      throw error;
    }
  }

  async getMessages(userId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages').select(`
          id,
          subject,
          content,
          created_at,
          read_at,
          status,
          thread_id,
          sender:profiles!sender_id(id, username),
          recipient:profiles!recipient_id(id, username)
        `)
        .filter('sender_id', 'eq', userId)
        .filter('recipient_id', 'eq', userId, 'or')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  async sendMessage(params: {
    userId: string;
    recipient: string;
    subject: string;
    content: string;
    threadId?: string;
  }): Promise<Message> {
    try {
      // Validate recipient
      const { data: recipientId, error: validationError } = await supabase.rpc(
        'validate_recipient', {
          recipient_username: params.recipient
        });

      if (validationError) {
        throw new Error(validationError.message);
      }
      
      // Verify recipient exists and is not the sender
      if (recipientId === params.userId) {
        throw new Error('Vous ne pouvez pas vous envoyer un message');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: params.userId,
          recipient_id: recipientId,
          subject: params.subject,
          content: params.content,
          thread_id: params.threadId || null,
        })
        .select(`
          id,
          subject,
          content,
          created_at,
          read_at,
          thread_id,
          status,
          sender:profiles!sender_id(id, username),
          recipient:profiles!recipient_id(id, username)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to delete message:', error);
      throw error;
    }
  }

  async deleteAllMessages(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .is('deleted_at', null);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to delete all messages:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to mark message as read:', error);
      throw error;
    }
  }
}

export const inboxService = new InboxService();