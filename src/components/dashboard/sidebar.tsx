// components/dashboard/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Laptop, Code, Video, BookOpen, Plus } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const routes = [
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
        <nav className="flex flex-col gap-1 p-2">
          {routes.map((route) => (
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