// src/components/execute-code/ExecuteCodeView.tsx
"use client";

import { useCodeEditorStore, LANGUAGE_CONFIG, THEMES } from "@/store/useCodeEditorStore";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, Type,  Monitor, Save } from "lucide-react";
// import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export default function ExecuteCodeView() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  const { 
    language, 
    theme: editorTheme, 
    fontSize,
    isRunning,
    output,
    error,
    setLanguage,
    setTheme,
    setFontSize,
    setEditor,
    runCode,
    getCode
  } = useCodeEditorStore();

  // Protect against hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLanguageChange = (value: string) => {
    // Check if user has Pro access for non-JavaScript languages
    if (value !== 'javascript' && !session?.user?.isPro) {
      toast({
        title: "Pro subscription required",
        description: "Only JavaScript is available on the free plan. Upgrade to Pro for all languages.",
        variant: "destructive"
      });
      return;
    }
    
    setLanguage(value);
  };

  const handleRunCode = async () => {
    try {
      await runCode();
    } catch (error) {
      console.error("Error running code:", error);
    }
  };

  const handleEditorMount = (editor: any) => {
    setEditor(editor);
  };

  const handleSaveSnippet = async () => {
    const code = getCode();
    if (!code) return;
    
    // Save snippet logic will be added later
    toast({
      title: "Feature coming soon",
      description: "Saving snippets will be available soon!"
    });
  };

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Code Playground</h1>
          <p className="text-muted-foreground">Write, run and share code in multiple languages</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {language && (
                    <Image 
                      src={LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]?.logoPath || '/javascript.png'} 
                      alt={language} 
                      width={16} 
                      height={16} 
                    />
                  )}
                  {LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]?.label || language}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_CONFIG).map(([key, value]) => (
                <SelectItem 
                  key={key} 
                  value={key}
                  disabled={key !== 'javascript' && !session?.user?.isPro}
                >
                  <div className="flex items-center gap-2">
                    <Image src={value.logoPath} alt={value.label} width={16} height={16} />
                    <span>{value.label}</span>
                    {key !== 'javascript' && !session?.user?.isPro && (
                      <span className="ml-2 text-xs text-yellow-500">Pro</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleSaveSnippet}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-220px)]">
        {/* Editor Panel */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-2 border-b bg-muted">
            <div className="flex items-center gap-2">
              <Select value={editorTheme} onValueChange={setTheme}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue>
                    {THEMES.find(t => t.id === editorTheme)?.label || 'Theme'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: theme.color }}
                        />
                        <span>{theme.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <Slider 
                  value={[fontSize]} 
                  min={12} 
                  max={24} 
                  step={1} 
                  className="w-[100px]"
                  onValueChange={(value) => setFontSize(value[0])}
                />
                <span className="text-xs text-muted-foreground w-6">{fontSize}</span>
              </div>
            </div>
            
            <Button onClick={handleRunCode} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run
                </>
              )}
            </Button>
          </div>
          
          <div className="flex-grow">
            <Editor
              height="100%"
              defaultLanguage={LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]?.monacoLanguage || 'javascript'}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light'}
              onMount={handleEditorMount}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                tabSize: 2,
                fontFamily: '"Geist Mono", monospace',
              }}
            />
          </div>
        </div>
        
        {/* Output Panel */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center p-2 border-b bg-muted">
            <h3 className="font-medium">Output</h3>
          </div>
          
          <div className="flex-grow p-4 font-mono text-sm overflow-auto bg-black text-white">
            {isRunning ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-400">
                <div className="font-bold mb-2">Error:</div>
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Monitor className="h-16 w-16 mb-4" />
                <div className="text-center">
                  <p className="mb-2 text-lg">Run your code to see the output here</p>
                  <p>Use the Run button to execute your code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}