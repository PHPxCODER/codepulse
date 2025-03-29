import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Star or unstar a snippet
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const snippetId = params.id;
    
    // Check if snippet exists
    const snippet = await prisma.snippet.findUnique({
      where: { id: snippetId },
    });
    
    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }
    
    // Check if already starred
    const existingStar = await prisma.star.findFirst({
      where: {
        userId: session.user.id,
        snippetId,
      },
    });
    
    if (existingStar) {
      // Remove star
      await prisma.star.delete({
        where: { id: existingStar.id },
      });
      
      return NextResponse.json({ starred: false });
    } else {
      // Add star
      await prisma.star.create({
        data: {
          userId: session.user.id,
          snippetId,
        },
      });
      
      return NextResponse.json({ starred: true });
    }
  } catch (error) {
    console.error("Error toggling star:", error);
    return NextResponse.json(
      { error: "Error toggling star" },
      { status: 500 }
    );
  }
}

// Check if snippet is starred by current user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const snippetId = params.id;
    
    if (!session?.user?.id) {
      return NextResponse.json({ starred: false });
    }
    
    const star = await prisma.star.findFirst({
      where: {
        userId: session.user.id,
        snippetId,
      },
    });
    
    return NextResponse.json({ starred: !!star });
  } catch (error) {
    console.error("Error checking star status:", error);
    return NextResponse.json(
      { error: "Error checking star status" },
      { status: 500 }
    );
  }
}

