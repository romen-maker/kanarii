type SyncTrackerCallback = (pendingCount: number) => void;

class SyncTracker {
  private pendingWrites = 0;
  private listeners: Set<SyncTrackerCallback> = new Set();

  getPendingWrites(): number {
    return this.pendingWrites;
  }

  subscribe(callback: SyncTrackerCallback): () => void {
    this.listeners.add(callback);
    callback(this.pendingWrites);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((callback) => callback(this.pendingWrites));
  }

  /**
   * Envuelve una promesa de escritura en Firestore para rastrear su progreso local.
   */
  async trackWrite<T>(promise: Promise<T>): Promise<T> {
    this.pendingWrites++;
    this.notify();
    try {
      return await promise;
    } finally {
      this.pendingWrites = Math.max(0, this.pendingWrites - 1);
      this.notify();
    }
  }
}

export const syncTracker = new SyncTracker();
