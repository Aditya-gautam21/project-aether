export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'completed' | 'error';
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  lastMessage?: string;
  isActive?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  chats: Chat[];
}

export interface ApiResponse {
  result: string;
  status: string;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
}

export interface Task {
  id: number;
  name: string;
  priority: string;
  status: string;
  created_at: string;
}
