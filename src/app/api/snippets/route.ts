// src/app/api/snippets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Get all snippets
export async function GET() {
  try {
    const snippets = await prisma.snippet.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error getting snippets:", error);
    return NextResponse.json(
      { error: "Error getting snippets" },
      { status: 500 }
    );
  }
}

// Create a new snippet
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { title, language, code } = await req.json();
    
    if (!title || !language || !code) {
      return NextResponse.json(
        { error: "Title, language, and code are required" },
        { status: 400 }
      );
    }
    
    const snippet = await prisma.snippet.create({
      data: {
        title,
        language,
        code,
        userName: session.user.name || 'Anonymous',
        user: {
          connect: { id: session.user.id },
        },
      },
    });
    
    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error: "Error creating snippet" },
      { status: 500 }
    );
  }
}