import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";
import Task from "@/models/Task";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Attach owner info and task count
    const result = await Promise.all(
      projects.map(async (p) => {
        const owner = await User.findById(p.ownerId, { name: 1, email: 1 }).lean();
        const taskCount = await Task.countDocuments({ projectId: p._id });
        return {
          id: String(p._id),
          name: p.name,
          description: p.description,
          createdAt: p.createdAt,
          owner: { id: String(owner?._id), name: owner?.name, email: owner?.email },
          _count: { tasks: taskCount },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only Admins can create projects" }, { status: 403 });
    }

    const { name, description } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const project = await Project.create({
      name,
      description,
      ownerId: (session.user as any).id,
    });

    return NextResponse.json({ id: String(project._id), name: project.name }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
