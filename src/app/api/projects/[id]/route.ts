import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";
import Task from "@/models/Task";
import User from "@/models/User";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const project = await Project.findById(id).lean();
    if (!project) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const owner = await User.findById(project.ownerId, { name: 1, email: 1 }).lean();

    const tasks = await Task.find({ projectId: id })
      .sort({ createdAt: -1 })
      .lean();

    const tasksWithAssignee = await Promise.all(
      tasks.map(async (t) => {
        const assignee = t.assigneeId
          ? await User.findById(t.assigneeId, { name: 1, email: 1 }).lean()
          : null;
        return {
          id: String(t._id),
          title: t.title,
          description: t.description,
          status: t.status,
          dueDate: t.dueDate,
          assigneeId: t.assigneeId ? String(t.assigneeId) : null,
          assignee: assignee
            ? { id: String(assignee._id), name: assignee.name, email: assignee.email }
            : null,
          createdAt: t.createdAt,
        };
      })
    );

    return NextResponse.json({
      id: String(project._id),
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: { id: String(owner?._id), name: owner?.name, email: owner?.email },
      tasks: tasksWithAssignee,
    });
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

    await Task.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
