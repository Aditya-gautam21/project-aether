export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt: Date;
}

export type MessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolName: string; args: any }
  | { type: 'tool-result'; result: any };

export interface Chat {
  id: string;
  title: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  path: string;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text: string }>;
}