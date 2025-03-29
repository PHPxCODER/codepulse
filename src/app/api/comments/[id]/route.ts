// src/app/api/comments/[id]/route.ts

import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

// Delete a comment
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const comment = await prisma.comment.findUnique({
        where: { id: params.id },
      });
      
      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      
      // Check if user owns the comment
      if (comment.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized to delete this comment" },
          { status: 403 }
        );
      }
      
      await prisma.comment.delete({
        where: { id: params.id },
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { error: "Error deleting comment" },
        { status: 500 }
      );
    }
  }