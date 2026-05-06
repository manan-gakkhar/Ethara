import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({}, { name: 1, email: 1, role: 1 }).lean();

    return NextResponse.json(
      users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role }))
    );
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
