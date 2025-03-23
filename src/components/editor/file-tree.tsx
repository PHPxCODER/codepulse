"use client";

import { SVGProps, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  File,
  FileCode, 
  FileText, 
  FileJson,
  Plus,
  Trash
} from "lucide-react";

interface FileTreeProps {
  files: any[];
  selectedFile: any;
  onSelectFile: (file: any) => void;
}

export default function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (path: string) => {
    if (path.endsWith('.js')) return <FileCode className="h-4 w-4 mr-2" />;
    if (path.endsWith('.html')) return <VscodeIconsFileTypeHtml className="h-4 w-4 mr-2" />;
    if (path.endsWith('.css')) return <VscodeIconsFileTypeCss2 className="h-4 w-4 mr-2" />;
    if (path.endsWith('.json')) return <FileJson className="h-4 w-4 mr-2" />;
    if (path.endsWith('.md')) return <FileText className="h-4 w-4 mr-2" />;
    return <File className="h-4 w-4 mr-2" />;
  };

  const handleCreateFile = async () => {
    if (!newFileName) return;
    
    setIsLoading(true);
    try {
      // Add file extension if not provided
      let filename = newFileName;
      if (!filename.includes('.')) {
        filename += '.js'; // Default to JS
      }
      
      const response = await fetch(`/api/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: filename,
          path: `/${filename}`,
          content: `// ${filename}\n`,
          projectId: files[0].projectId, // Assuming all files have the same projectId
        }),
      });

      if (response.ok) {
        const newFile = await response.json();
        onSelectFile(newFile);
        setNewFileDialogOpen(false);
        setNewFileName("");
        // Refresh the page to show new file
        window.location.reload();
      } else {
        console.error("Failed to create file");
      }
    } catch (error) {
      console.error("Error creating file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (files.length <= 1) {
      alert("Cannot delete the last file in the project.");
      return;
    }

    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          // If the deleted file was selected, select another file
          if (selectedFile.id === fileId) {
            const remainingFiles = files.filter(f => f.id !== fileId);
            onSelectFile(remainingFiles[0]);
          }
          
          // Refresh the page to update file list
          window.location.reload();
        } else {
          console.error("Failed to delete file");
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Files</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setNewFileDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {files.map((file) => (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm",
                  selectedFile.id === file.id && "bg-primary/10 text-primary"
                )}
                onClick={() => onSelectFile(file)}
              >
                {getFileIcon(file.path)}
                {file.name}
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleDeleteFile(file.id)} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name for your new file. Add an extension or a default .js will be used.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewFileDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFile} 
              disabled={isLoading || !newFileName}
            >
              {isLoading ? "Creating..." : "Create File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export function VscodeIconsFileTypeHtml(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" {...props}><path fill="#e44f26" d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30z"></path><path fill="#f1662a" d="m16 27.858l8.17-2.265l1.922-21.532H16z"></path><path fill="#ebebeb" d="M16 13.407h-4.09l-.282-3.165H16V7.151H8.25l.074.83l.759 8.517H16zm0 8.027l-.014.004l-3.442-.929l-.22-2.465H9.221l.433 4.852l6.332 1.758l.014-.004z"></path><path fill="#fff" d="M15.989 13.407v3.091h3.806l-.358 4.009l-3.448.93v3.216l6.337-1.757l.046-.522l.726-8.137l.076-.83zm0-6.256v3.091h7.466l.062-.694l.141-1.567l.074-.83z"></path></svg>
    )
  }

  
export function VscodeIconsFileTypeCss2(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" {...props}><path fill="#1572b6" d="M5.902 27.201L3.656 2h24.688l-2.249 25.197L15.985 30z"></path><path fill="#33a9dc" d="m16 27.858l8.17-2.265l1.922-21.532H16z"></path><path fill="#fff" d="M16 13.191h4.09l.282-3.165H16V6.935h7.75l-.074.829l-.759 8.518H16z"></path><path fill="#ebebeb" d="m16.019 21.218l-.014.004l-3.442-.93l-.22-2.465H9.24l.433 4.853l6.331 1.758l.015-.004z"></path><path fill="#fff" d="m19.827 16.151l-.372 4.139l-3.447.93v3.216l6.336-1.756l.047-.522l.537-6.007z"></path><path fill="#ebebeb" d="M16.011 6.935v3.091H8.545l-.062-.695l-.141-1.567l-.074-.829zM16 13.191v3.091h-3.399l-.062-.695l-.14-1.567l-.074-.829z"></path></svg>
    )
  }