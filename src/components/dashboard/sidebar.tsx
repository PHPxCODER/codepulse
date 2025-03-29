// src/components/dashboard/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Laptop, 
  Code, 
  Video, 
  BookOpen, 
  Plus, 
  Sparkles, 
  Play, 
  FileCode,
  Star
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  // Define base routes
  const baseRoutes = [
    {
      label: "Projects",
      icon: Laptop,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Coding Sessions",
      icon: Code,
      href: "/dashboard/sessions",
      active: pathname === "/dashboard/sessions",
    },
    {
      label: "Recordings",
      icon: Video,
      href: "/dashboard/recordings",
      active: pathname === "/dashboard/recordings",
    },
    {
      label: "Courses",
      icon: BookOpen,
      href: "/dashboard/courses",
      active: pathname === "/dashboard/courses",
    },
  ];
  
  // Define new CodeCraft features
  const codeCraftRoutes = [
    {
      label: "Code Execution",
      icon: Play,
      href: "/execute",
      active: pathname === "/execute",
    },
    {
      label: "Code Snippets",
      icon: FileCode,
      href: "/snippets",
      active: pathname.startsWith("/snippets"),
    },
    {
      label: "Starred Snippets",
      icon: Star,
      href: "/snippets/starred",
      active: pathname === "/snippets/starred",
    },
    {
      label: "Upgrade to Pro",
      icon: Sparkles,
      href: "/pricing",
      active: pathname === "/pricing",
      highlight: true,
    },
  ];

  return (
    <div
      className={cn(
        "h-full border-r bg-white dark:bg-gray-950 flex flex-col transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="p-3">
        <Button className="w-full justify-start" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {!isCollapsed && "New Project"}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Original Features Section */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="px-4 text-xs uppercase font-medium text-muted-foreground mb-2">
              Projects
            </p>
          )}
          <nav className="flex flex-col gap-1 p-2">
            {baseRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  route.active
                    ? "text-primary bg-primary/10"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>{route.label}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* CodeCraft Features Section */}
        <div>
          {!isCollapsed && (
            <p className="px-4 text-xs uppercase font-medium text-muted-foreground mb-2">
              Code Tools
            </p>
          )}
          <nav className="flex flex-col gap-1 p-2">
            {codeCraftRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
                  route.active
                    ? "text-primary bg-primary/10"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-primary hover:bg-primary/10",
                  route.highlight && !route.active && "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-500"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", isCollapsed && "mr-0")} />
                  {!isCollapsed && <span>{route.label}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-3 mt-auto border-t">
        <Button
          variant="ghost"
          className="w-full justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="sm"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>
    </div>
  );

}