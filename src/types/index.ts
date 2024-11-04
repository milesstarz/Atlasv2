export type ContentType = 'link' | 'image' | 'text' | 'article';

export interface ContentItem {
  id: string;
  type: ContentType;
  content: string;
  preview?: string;
  tags: string[];
  createdAt: Date;
  folder?: string;
}

export interface User {
  id: string;
  username: string;
}