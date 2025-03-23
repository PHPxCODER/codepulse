import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth.config";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner: {
          connect: {
            id: session.user.id,
          },
        },
        files: {
          create: [
            {
              name: "main.js",
              path: "/main.js",
              content: "// Welcome to CodePulse!\n\nconsole.log('Hello, world!');\n",
            },
            {
              name: "index.html",
              path: "/index.html",
              content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n  <script src=\"main.js\"></script>\n</head>\n<body>\n  <h1>Welcome to CodePulse!</h1>\n</body>\n</html>\n",
            },
          ],
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
