// app/api/files/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth.config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

// Initialize S3 client (for MinIO)
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  endpoint: process.env.MINIO_ENDPOINT as string,
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY as string,
    secretAccessKey: process.env.MINIO_SECRET_KEY as string,
  },
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME as string;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileId = params.id;
    const { content } = await request.json();

    // Find the file
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        project: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if user owns the project
    if (file.project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upload content to MinIO
    const objectKey = `projects/${file.project.id}${file.path}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
        Body: content,
        ContentType: getContentType(file.path),
      })
    );

    // Update file in database
    const updatedFile = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

// Helper function to determine content type
function getContentType(path: string) {
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.md')) return 'text/markdown';
  return 'text/plain';
}

// For creating new files
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, path, content, projectId } = await request.json();

    // Find the project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user owns the project
    if (project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create file in database
    const newFile = await prisma.file.create({
      data: {
        name,
        path,
        content,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    // Upload content to MinIO
    const objectKey = `projects/${projectId}${path}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
        Body: content,
        ContentType: getContentType(path),
      })
    );

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file" },
      { status: 500 }
    );
  }
}