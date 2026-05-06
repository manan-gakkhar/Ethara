import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
    });

    return NextResponse.json(
      { message: "Account created successfully", user: { id: String(user._id), email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error?.message ?? error);
    // Surface duplicate key error clearly
    if (error?.code === 11000) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
