export type Bot = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
  display_name: string | null;
  welcome_message: string | null;
  widget_color: string | null;
};

export type DocumentFile = {
  id: string;
  filename: string;
  bot_id: string;
  chunk_count: number;
  created_at: string;
};

export type LocalMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatApiResponse = {
  question: string;
  answer: string;
  sources: string[];
  conversation_id: string;
};

export type Conversation = {
  id: string;
  bot_id: string;
  title: string;
  created_at: string;
};

export type ConversationDetail = Conversation & {
  messages: ChatMessage[];
};

export type BotAnalytics = {
  total_conversations: number;
  total_questions: number;
  daily: { date: string; questions: number }[];
};
