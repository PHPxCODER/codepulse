import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// src/app/api/snippets/[id]/stars/route.ts
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const snippetId = params.id;
      
      const count = await prisma.star.count({
        where: { snippetId },
      });
      
      return NextResponse.json({ count });
    } catch (error) {
      console.error("Error getting star count:", error);
      return NextResponse.json(
        { error: "Error getting star count" },
        { status: 500 }
      );
    }
  }