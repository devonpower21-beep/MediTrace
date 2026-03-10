/**
 * Global batch store for the database viewer
 * Uses globalThis to persist across hot reloads in development
 */

export interface BatchRecord {
    _id: string;
    batchId: string;
    data: {
        temperature_avg: number;
        vibration_shock: number;
        route_efficiency: number;
    };
    mlResult: {
        status: string;
        risk_score: number;
    };
    txHash: string;
    status: string;
    createdAt: string;
}

// Use globalThis to persist across hot reloads
const globalForBatches = globalThis as unknown as {
    batchStore: BatchRecord[] | undefined;
};

export const batchStore: BatchRecord[] = globalForBatches.batchStore ?? [];

if (process.env.NODE_ENV !== 'production') {
    globalForBatches.batchStore = batchStore;
}

export function addBatch(batch: BatchRecord) {
    batchStore.push(batch);
    // Keep only last 50 records
    if (batchStore.length > 50) {
        batchStore.splice(0, batchStore.length - 50);
    }
}

export function getAllBatches(): BatchRecord[] {
    return batchStore.slice().reverse(); // Most recent first
}
