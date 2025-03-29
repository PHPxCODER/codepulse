// src/app/api/code/execute/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language, version, code } = await req.json();
    
    // If language is not JavaScript, check if user is Pro
    if (language !== 'javascript') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      
      if (!user?.isPro) {
        return NextResponse.json({
          error: "Pro subscription required to use this language",
        }, { status: 403 });
      }
    }
    
    // Call Piston API to execute code
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: code }],
      }),
    });
    
    const data = await response.json();
    
    // Handle API errors
    if (data.message) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    
    // Handle compilation errors
    if (data.compile && data.compile.code !== 0) {
      const error = data.compile.stderr || data.compile.output;
      return NextResponse.json({ error }, { status: 400 });
    }
    
    // Handle runtime errors
    if (data.run && data.run.code !== 0) {
      const error = data.run.stderr || data.run.output;
      return NextResponse.json({ error }, { status: 400 });
    }
    
    // Save execution to database
    await prisma.codeExecution.create({
      data: {
        language,
        code,
        output: data.run.output,
        error: null,
        user: {
          connect: { id: session.user.id },
        },
      },
    });
    
    // Return successful output
    return NextResponse.json({ output: data.run.output });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: "Error executing code" },
      { status: 500 }
    );
  }
}