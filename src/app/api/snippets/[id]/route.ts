// src/app/api/snippets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Get a snippet by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
    });
    
    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }
    
    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error getting snippet:", error);
    return NextResponse.json(
      { error: "Error getting snippet" },
      { status: 500 }
    );
  }
}

// Delete a snippet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const snippet = await prisma.snippet.findUnique({
      where: { id: params.id },
    });
    
    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }
    
    // Check if user owns the snippet
    if (snippet.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this snippet" },
        { status: 403 }
      );
    }
    
    // Delete related records first
    await prisma.comment.deleteMany({
      where: { snippetId: params.id },
    });
    
    await prisma.star.deleteMany({
      where: { snippetId: params.id },
    });
    
    // Delete the snippet
    await prisma.snippet.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { error: "Error deleting snippet" },
      { status: 500 }
    );
  }
}