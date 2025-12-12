export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  input: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  output: string;
}
