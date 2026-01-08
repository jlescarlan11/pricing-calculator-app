export type AnalyticsEventType = 'view' | 'click' | 'export';

export interface AnalyticsEvent {
  id?: string;
  userId: string;
  presetId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, any>;
  clickedAt?: string;
}
