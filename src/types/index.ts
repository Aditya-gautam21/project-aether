export interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  isActive?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  chats: Chat[];
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ApiResponse {
  result: string;
  status: string;
}
