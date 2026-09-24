import request from './request';
import type { Book } from '@/types';

export interface BrowsingHistoryItem {
  id: string;
  viewedAt: string;
  book: Book;
}

export const getBrowsingHistory = () => {
  return request.get<BrowsingHistoryItem[]>('/browsing-history');
};

export const removeBrowsingHistory = (bookId: string) => {
  return request.delete(`/browsing-history/${bookId}`);
};

export const clearBrowsingHistory = () => {
  return request.delete('/browsing-history');
};
