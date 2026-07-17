import { randomUUID } from 'node:crypto';

import type { WebSocket } from 'ws';

export type TrackedClient = {
  connectionId: string;
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
  ws: WebSocket;
  connectedAt: number;
  lastPongAt: number;
};

export type RealtimeTarget = {
  organizationId: string;
  userId?: string | null;
};

/**
 * Per-user / per-org connection registry.
 * Supports multiple tabs (multiple sockets) per user.
 */
export class ConnectionRegistry {
  private readonly byConnection = new Map<string, TrackedClient>();
  private readonly byUser = new Map<string, Set<string>>();
  private readonly byOrg = new Map<string, Set<string>>();

  add(input: Omit<TrackedClient, 'connectionId' | 'connectedAt' | 'lastPongAt'>): TrackedClient {
    const client: TrackedClient = {
      ...input,
      connectionId: randomUUID(),
      connectedAt: Date.now(),
      lastPongAt: Date.now(),
    };
    this.byConnection.set(client.connectionId, client);

    const userSet = this.byUser.get(client.userId) ?? new Set();
    userSet.add(client.connectionId);
    this.byUser.set(client.userId, userSet);

    const orgSet = this.byOrg.get(client.organizationId) ?? new Set();
    orgSet.add(client.connectionId);
    this.byOrg.set(client.organizationId, orgSet);

    return client;
  }

  remove(connectionId: string): void {
    const client = this.byConnection.get(connectionId);
    if (!client) return;
    this.byConnection.delete(connectionId);

    const userSet = this.byUser.get(client.userId);
    if (userSet) {
      userSet.delete(connectionId);
      if (userSet.size === 0) this.byUser.delete(client.userId);
    }

    const orgSet = this.byOrg.get(client.organizationId);
    if (orgSet) {
      orgSet.delete(connectionId);
      if (orgSet.size === 0) this.byOrg.delete(client.organizationId);
    }
  }

  touchPong(connectionId: string): void {
    const client = this.byConnection.get(connectionId);
    if (client) client.lastPongAt = Date.now();
  }

  get(connectionId: string): TrackedClient | undefined {
    return this.byConnection.get(connectionId);
  }

  listStale(maxIdleMs: number): TrackedClient[] {
    const cutoff = Date.now() - maxIdleMs;
    return [...this.byConnection.values()].filter((c) => c.lastPongAt < cutoff);
  }

  resolve(target: RealtimeTarget): TrackedClient[] {
    if (target.userId) {
      const ids = this.byUser.get(target.userId);
      if (!ids) return [];
      return [...ids]
        .map((id) => this.byConnection.get(id))
        .filter((c): c is TrackedClient =>
          Boolean(c && c.organizationId === target.organizationId)
        );
    }

    const ids = this.byOrg.get(target.organizationId);
    if (!ids) return [];
    return [...ids]
      .map((id) => this.byConnection.get(id))
      .filter((c): c is TrackedClient => Boolean(c));
  }

  size(): number {
    return this.byConnection.size;
  }

  forEach(callback: (client: TrackedClient) => void): void {
    for (const client of this.byConnection.values()) {
      callback(client);
    }
  }

  clear(): void {
    this.byConnection.clear();
    this.byUser.clear();
    this.byOrg.clear();
  }
}
