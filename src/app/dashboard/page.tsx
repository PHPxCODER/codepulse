// app/dashboard/page.tsx
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ProjectCard from "@/components/dashboard/project-card";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

const prisma = new PrismaClient();

async function getProjects(userId: string) {
  return await prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const projects = session?.user?.id 
    ? await getProjects(session.user.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 border rounded-lg shadow-sm space-y-4">
          <h3 className="text-xl font-medium">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Create your first project to start coding collaboratively. 
            Projects can be shared with other developers for real-time collaboration.
          </p>
          <NewProjectDialog>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </NewProjectDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}