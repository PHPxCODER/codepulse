"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileCode, 
  Clock, 
  User, 
  Plus, 
  X,
  Sparkles, 
  Star,
  Star as StarIcon
} from "lucide-react";
// import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  userName: string;
  userId: string;
  createdAt: Date;
}

interface SnippetsViewProps {
  snippets: Snippet[];
  isPro: boolean;
}

export default function SnippetsView({ snippets: initialSnippets, isPro }: SnippetsViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  
  // Get unique languages from snippets
  const languages = Array.from(new Set(snippets.map(s => s.language)));
  
  // Filter snippets based on search query and selected language
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;
    
    return matchesSearch && matchesLanguage;
  });
  
  const handleDeleteSnippet = async (snippetId: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Remove deleted snippet from state
        setSnippets(prevSnippets => 
          prevSnippets.filter(snippet => snippet.id !== snippetId)
        );
        
        toast({
          title: "Snippet deleted",
          description: "Your snippet has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete snippet");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast({
        title: "Error",
        description: "Failed to delete snippet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStarSnippet = async (snippetId: string) => {
    try {
      await fetch(`/api/snippets/${snippetId}/star`, {
        method: "POST",
      });
      
      // Optimistic UI update would go here in a real implementation
      // For now, just show a toast
      toast({
        title: "Snippet starred",
        description: "You can find your starred snippets in the Starred tab.",
      });
    } catch (error) {
      console.error("Error starring snippet:", error);
      toast({
        title: "Error",
        description: "Failed to star snippet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Code Snippets</h1>
          <p className="text-muted-foreground">Browse, share and save code snippets</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/execute")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Snippet
          </Button>
          
          {!isPro && (
            <Button variant="outline" onClick={() => router.push("/pricing")}>
              <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
              <span className="text-yellow-500">Upgrade to Pro</span>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Snippets</TabsTrigger>
          <TabsTrigger value="mine">My Snippets</TabsTrigger>
          <TabsTrigger value="starred">
            <Star className="h-4 w-4 mr-2" />
            Starred
          </TabsTrigger>
        </TabsList>
        
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search snippets by title, language or author..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Language filters */}
          <div className="flex flex-wrap gap-2">
            {languages.map(language => (
              <Button
                key={language}
                variant={selectedLanguage === language ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(selectedLanguage === language ? null : language)}
                className="flex items-center gap-2"
              >
                <Image 
                  src={`/${language}.png`} 
                  alt={language} 
                  width={16} 
                  height={16}
                  onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.src = '/javascript.png';
                  }}
                />
                {language}
              </Button>
            ))}
            
            {selectedLanguage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLanguage(null)}
              >
                <X className="h-4 w-4 mr-1" />
                Clear filter
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="all">
          {filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map(snippet => (
                <Card key={snippet.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{snippet.title}</CardTitle>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                              {snippet.language}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleStarSnippet(snippet.id)}
                      >
                        <StarIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <div className="h-32 overflow-hidden rounded bg-muted p-2">
                      <pre className="text-xs font-mono overflow-hidden">
                        {snippet.code.substring(0, 300)}
                        {snippet.code.length > 300 && '...'}
                      </pre>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{snippet.userName}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => router.push(`/snippets/${snippet.id}`)}
                    >
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No snippets found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedLanguage
                  ? "Try adjusting your search or filters"
                  : "Be the first to share a code snippet!"}
              </p>
              
              <Button onClick={() => router.push("/execute")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Snippet
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mine">
          {filteredSnippets.filter(s => s.userId === session?.user?.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets
                .filter(s => s.userId === session?.user?.id)
                .map(snippet => (
                  <Card key={snippet.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <FileCode className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{snippet.title}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                {snippet.language}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteSnippet(snippet.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0">
                      <div className="h-32 overflow-hidden rounded bg-muted p-2">
                        <pre className="text-xs font-mono overflow-hidden">
                          {snippet.code.substring(0, 300)}
                          {snippet.code.length > 300 && '...'}
                        </pre>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/snippets/${snippet.id}`)}
                      >
                        View
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No snippets found</h3>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t created any snippets yet
              </p>
              
              <Button onClick={() => router.push("/execute")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Snippet
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="starred">
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Starred Snippets Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              This feature is currently being developed
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}