import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Task from "@/models/Task";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isAssignee = task.assigneeId && String(task.assigneeId) === (session.user as any).id;

    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { status, assigneeId } = await req.json();

    if (status) task.status = status;
    if (isAdmin && assigneeId !== undefined) {
      task.assigneeId = assigneeId || undefined;
    }

    await task.save();

    return NextResponse.json({ id: String(task._id), status: task.status });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    await Task.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
