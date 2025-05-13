import { Message } from "ai/react";

export type MessageMetadata = Partial<Message> & {
  id?: string;
  start?: number;
  response?: number;
  end?: number;
  ttsModel?: string;
};
