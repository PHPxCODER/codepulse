// app/project/[id]/layout.tsx
import { LiveblocksProvider } from "@/components/providers/liveblocks-provider";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiveblocksProvider>{children}</LiveblocksProvider>;
}