/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/recordings/[id]/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth.config";
import SessionPlayer from "@/components/session/session-player";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Share } from "lucide-react";

const prisma = new PrismaClient();

async function getSession(id: string, userId: string) {
  const session = await prisma.codeSession.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          files: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check if user is a member of this session
  const isMember = session.members.some((member) => member.userId === userId);
  if (!isMember) return null;

  return session;
}

export default async function RecordingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const codeSession = await getSession(params.id, session.user.id);
  
  if (!codeSession) {
    redirect("/dashboard/recordings");
  }

  // Check if this session has recording data
  if (!codeSession.recording) {
    redirect("/dashboard/recordings");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/recordings">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{codeSession.name}</h1>
        </div>
        
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share Recording
        </Button>
      </div>
      
      <div className="flex-1 border rounded-lg overflow-hidden shadow-sm">
        <SessionPlayer 
          session={codeSession} 
          recording={codeSession.recording as any[]} 
        />
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Session Details</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <p><span className="font-medium">Project:</span> {codeSession.project.name}</p>
            <p><span className="font-medium">Created:</span> {new Date(codeSession.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">Duration:</span> {
              codeSession.endedAt 
                ? `${Math.round((new Date(codeSession.endedAt).getTime() - new Date(codeSession.createdAt).getTime()) / 60000)} minutes`
                : "Not ended"
            }</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Participants</h3>
          <div className="space-y-2">
            {codeSession.members.map((member: any) => (
              <div key={member.id} className="flex items-center text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs mr-2">
                  {member.user.name?.[0] || "U"}
                </div>
                <span>{member.user.name}</span>
                {member.role === "host" && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Convert to Course</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add explanations to this session to turn it into a sharable course.
          </p>
          <Link href={`/dashboard/courses/create?from=${codeSession.id}`}>
            <Button>Create Course</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


