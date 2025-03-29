import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import SnippetDetailView from "./snippet-detail-view";

export default async function SnippetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  
  // Get the snippet
  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
  });
  
  if (!snippet) {
    notFound();
  }
  
  // Get comments
  const comments = await prisma.comment.findMany({
    where: { snippetId: params.id },
    orderBy: { createdAt: "desc" },
  });
  
  // Check if user has starred this snippet
  const star = await prisma.star.findFirst({
    where: {
      userId: session.user.id,
      snippetId: params.id,
    },
  });
  
  // Get star count
  const starCount = await prisma.star.count({
    where: { snippetId: params.id },
  });
  
  return (
    <SnippetDetailView
      snippet={snippet}
      comments={comments}
      isStarred={!!star}
      starCount={starCount}
      currentUser={session.user}
    />
  );
}