export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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
