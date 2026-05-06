import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Task from "@/models/Task";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only Admins can create tasks" }, { status: 403 });
    }

    const { title, description, projectId, assigneeId, dueDate } = await req.json();

    if (!title || !description || !projectId) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ id: String(task._id), title: task.title }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
