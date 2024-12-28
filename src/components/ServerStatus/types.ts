export interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  error: string | null;
}

export interface ServerStatusProps {
  className?: string;
}