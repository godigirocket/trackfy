export interface TrackingEvent {
  id: string;
  timestamp: string;
  url: string;
  referrer: string;
  utm_source?: string;
  utm_campaign?: string;
  fbclid?: string;
  gclid?: string;
  session_id: string;
  device: string;
  location: string;
  type: 'paid' | 'organic';
}

// In-memory store for demo (would be a DB in production)
let events: TrackingEvent[] = [];

export function addEvent(data: any) {
  const isPaid = !!(data.src || data.cam || data.fb || data.gclid || data.url.includes('utm_'));
  
  const event: TrackingEvent = {
    id: Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    url: data.url,
    referrer: data.ref,
    utm_source: data.src,
    utm_campaign: data.cam,
    fbclid: data.fb,
    gclid: data.gclid,
    session_id: data.sid,
    device: data.device || 'Desktop', // simplified
    location: data.location || 'Brasil', // simplified
    type: isPaid ? 'paid' : 'organic'
  };
  
  events.push(event);
  return event;
}

export function getEvents() {
  return events;
}
