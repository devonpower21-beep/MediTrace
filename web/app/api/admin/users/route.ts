import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "Admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("Admin users fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
