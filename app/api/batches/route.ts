/**
 * API Route: GET /api/batches
 * Fetches all batch records from the global store for the database viewer
 */
import { NextResponse } from 'next/server';
import { getAllBatches } from '@/lib/batchStore';

export async function GET() {
    try {
        const batches = getAllBatches();

        return NextResponse.json({
            success: true,
            count: batches.length,
            batches: batches
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch batches'
        }, { status: 500 });
    }
}
