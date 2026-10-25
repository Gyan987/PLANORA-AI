import { beforeEach, describe, expect, it } from 'vitest';
import { SAMPLE_EVENTS, storage } from '../../services/storage';
import { EventPlan } from '../../types';

describe('Client Storage Service Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns SAMPLE_EVENTS when localStorage is empty', () => {
    const events = storage.getEvents();
    expect(events.length).toBe(SAMPLE_EVENTS.length);
    expect(events[0].id).toBe(SAMPLE_EVENTS[0].id);
  });

  it('persists and retrieves updated events', () => {
    const customEvent: EventPlan = {
      ...SAMPLE_EVENTS[0],
      id: 'custom-event-123',
      name: 'Custom Corporate Gala'
    };

    storage.saveEvent(customEvent);
    const events = storage.getEvents();
    expect(events.length).toBe(SAMPLE_EVENTS.length + 1);
    expect(events[0].id).toBe('custom-event-123');
  });

  it('updates an existing event when saved with matching id', () => {
    const original = storage.getEvents()[0];
    const modified = { ...original, name: 'Updated Bengali Biye Name' };

    storage.saveEvent(modified);
    const events = storage.getEvents();
    const found = events.find((e) => e.id === original.id);
    expect(found?.name).toBe('Updated Bengali Biye Name');
  });

  it('deletes an event by id', () => {
    const initialEvents = storage.getEvents();
    const idToDelete = initialEvents[0].id;

    storage.deleteEvent(idToDelete);
    const remaining = storage.getEvents();
    expect(remaining.find((e) => e.id === idToDelete)).toBeUndefined();
    expect(remaining.length).toBe(initialEvents.length - 1);
  });

  it('manages active event id', () => {
    expect(storage.getActiveEventId()).toBe(SAMPLE_EVENTS[0].id);
    storage.setActiveEventId('custom-active-id');
    expect(storage.getActiveEventId()).toBe('custom-active-id');
  });

  it('manages theme preference', () => {
    expect(storage.getTheme()).toBe('light');
    storage.setTheme('dark');
    expect(storage.getTheme()).toBe('dark');
  });

  it('manages user profile in storage', () => {
    expect(storage.getUser()).toEqual({ name: 'Priya Sharma', email: 'priya.sharma@planora.ai' });
    const user = { name: 'Aarav Sharma', email: 'aarav@example.com' };
    storage.setUser(user);
    expect(storage.getUser()).toEqual(user);
  });
});
