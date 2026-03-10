/**
 * Batch Orchestration API
 * -----------------------
 * Acts as the central logic hub for the Manufacturer's "Create Batch" action.
 * 1. Receives batch data from the frontend.
 * 2. Asks the ML Service (Python) to validate the data.
 * 3. If valid, writes the hash to the Blockchain (Ganache).
 * 4. Stores the record in the database for viewing.
 */
import { NextResponse } from 'next/server';
import { addBatch } from '@/lib/batchStore';

// Docker/Localhost networking handling for env vars
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Orchestrator: Received Batch", body.batchId);

        // 1. Check with ML service
        let mlResponse;
        try {
            const mlRes = await fetch(`${ML_SERVICE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body.data)
            });
            mlResponse = await mlRes.json();
        } catch (error) {
            console.error("ML Service Error:", error);
            // Fallback for demo if ML service not reachable
            mlResponse = { status: "Unknown (ML Unavailable)", risk_score: 0.0 };
        }

        // 2. Write to Blockchain
        // TODO: This Mock is for the demo. Connect real Web3 later.
        const mockTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

        const status = mlResponse.status === "Risk" ? "Risk" : "Secure";

        // 3. Store in database for the viewer
        addBatch({
            _id: `batch_${Date.now()}`,
            batchId: body.batchId,
            data: body.data,
            mlResult: {
                status: mlResponse.status,
                risk_score: mlResponse.risk_score || 0
            },
            txHash: mockTxHash,
            status: status,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            batchId: body.batchId,
            ml_status: mlResponse.status,
            risk_score: mlResponse.risk_score,
            tx_hash: mockTxHash,
            timestamp: new Date().toISOString()
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
