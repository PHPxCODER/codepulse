// app/project/[id]/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Editor from "@/components/editor/editor";

const prisma = new PrismaClient();

async function getProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      files: true,
    },
  });

  if (!project) return null;
  if (project.ownerId !== userId) return null;

  return project;
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const project = await getProject(params.id, session.user.id);
  
  if (!project) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen flex flex-col">
      <Editor project={project} user={session.user} />
    </div>
  );
}