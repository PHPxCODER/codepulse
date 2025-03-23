"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RoomProvider,
  useStorage,
  useMutation,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  User,
  Bot,
} from "lucide-react";
import FileTree from "./file-tree";
import AIChatPanel from "./ai-chat-panel";
import VideoChat from "./video-chat";

const EditorComponent = ({ project, user }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(project.files[0]);
  const [code, setCode] = useState(selectedFile.content);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const files = useStorage((root) => root.files);
  const updateFile = useMutation(({ storage }, index, content) => {
    const filesList = storage.get("files");
    const file = filesList.get(index);
    file.update({ content });
  }, []);

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    setCode(selectedFile.content);
  }, [selectedFile]);

  const handleEditorDidMount = () => {
    // Initialize editor
  };

  const handleEditorChange = (value) => {
    setCode(value);

    // Find the index of the current file in the LiveList
    const index = files.findIndex((file) => file.id === selectedFile.id);
    if (index !== -1) {
      updateFile(index, value);
    }

    // Update cursor position for collaborative editing
    updateMyPresence({
      cursor: {
        file: selectedFile.id,
        // We would need to get the actual cursor position from Monaco
        // This is simplified
        position: { lineNumber: 1, column: 1 },
      },
    });
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const saveProject = async () => {
    setIsSaving(true);
    try {
      // Save the current file state to the database
      const response = await fetch(`/api/files/${selectedFile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: code,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-white dark:bg-gray-950 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 font-semibold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowVideoChat(!showVideoChat)}
          >
            <User className="h-4 w-4 mr-2" />
            {showVideoChat ? "Hide Video" : "Video Chat"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Bot className="h-4 w-4 mr-2" />
            {showAIPanel ? "Hide AI" : "AI Assistant"}
          </Button>
          <Button size="sm" onClick={saveProject} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <FileTree
            files={project.files}
            selectedFile={selectedFile}
            onSelectFile={handleFileSelect}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="justify-start m-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-0">
              <Editor
                height="100%"
                defaultLanguage={
                  selectedFile.path.endsWith(".js")
                    ? "javascript"
                    : selectedFile.path.endsWith(".html")
                    ? "html"
                    : selectedFile.path.endsWith(".css")
                    ? "css"
                    : selectedFile.path.endsWith(".json")
                    ? "json"
                    : "plaintext"
                }
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-0">
              <div className="h-full w-full bg-white">
                {/* Preview of HTML/CSS/JS would go here */}
                {selectedFile.path.endsWith(".html") ? (
                  <iframe
                    srcDoc={code}
                    className="w-full h-full"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Preview is only available for HTML files.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <div className="w-80 border-l bg-white dark:bg-gray-950 flex flex-col">
            <div className="p-3 border-b font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Robot className="h-4 w-4 mr-2" />
                AI Assistant
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIPanel(false)}
              >
                ×
              </Button>
            </div>
            <AIChatPanel
              code={code}
              onSuggest={(suggestion) => setCode(suggestion)}
            />
          </div>
        )}
      </div>

      {/* Video Chat Panel */}
      {showVideoChat && (
        <div className="h-64 border-t bg-gray-100 dark:bg-gray-900">
          <div className="p-3 border-b font-medium flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Video Chat
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVideoChat(false)}
            >
              X
            </Button>
          </div>
          <VideoChat />
        </div>
      )}
    </div>
  );
};

// Wrap with LiveBlocks room provider
export default function EditorWithLiveblocks({ project, user }) {
  return (
    <RoomProvider
      id={`project-${project.id}`}
      initialPresence={{
        cursor: null,
        name: user.name,
        image: user.image,
      }}
      initialStorage={{
        files: new LiveList(
          project.files.map(
            (file) =>
              new LiveObject({
                id: file.id,
                name: file.name,
                path: file.path,
                content: file.content,
              })
          )
        ),
      }}
    >
      <EditorComponent project={project} user={user} />
    </RoomProvider>
  );
}
