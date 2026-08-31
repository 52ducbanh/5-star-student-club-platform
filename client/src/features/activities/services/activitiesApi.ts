import { apiClient } from '@/shared/services/http/apiClient';
import type { NewsItem, EventItem } from '@5ss/contracts';

export const activitiesApi = {
  fetchNews(): Promise<NewsItem[]> {
    return apiClient.get<NewsItem[]>('/news');
  },

  fetchNewsItem(slug: string): Promise<NewsItem> {
    return apiClient.get<NewsItem>(`/news/${encodeURIComponent(slug)}`);
  },

  fetchEvents(): Promise<EventItem[]> {
    return apiClient.get<EventItem[]>('/events');
  },

  fetchEventItem(slug: string): Promise<EventItem> {
    return apiClient.get<EventItem>(`/events/${encodeURIComponent(slug)}`);
  },
};
