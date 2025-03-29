"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Clipboard, 
  MessageSquare, 
  Star as StarIcon, 
  User, 
  Clock,
  Check,
  Trash2
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  userName: string;
  userId: string;
  createdAt: Date;
}

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  userName: string;
  userId: string;
  createdAt: Date;
}

interface SnippetDetailViewProps {
  snippet: Snippet;
  comments: Comment[];
  isStarred: boolean;
  starCount: number;
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function SnippetDetailView({
  snippet,
  comments: initialComments,
  isStarred: initialIsStarred,
  starCount: initialStarCount,
  currentUser,
}: SnippetDetailViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [starCount, setStarCount] = useState(initialStarCount);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const canDelete = snippet.userId === currentUser.id;
  
  const handleStar = async () => {
    try {
      const response = await fetch(`/api/snippets/${snippet.id}/star`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update UI optimistically
        setIsStarred(data.starred);
        setStarCount(prev => data.starred ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Error starring snippet:", error);
      toast({
        title: "Error",
        description: "Failed to star snippet.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying code:", error);
      toast({
        title: "Error",
        description: "Failed to copy code.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/snippets/${snippet.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment("");
        toast({
          title: "Comment added",
          description: "Your comment has been added.",
        });
      } else {
        throw new Error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast({
          title: "Comment deleted",
          description: "Your comment has been deleted.",
        });
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSnippet = async () => {
    if (!canDelete) return;
    
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/snippets/${snippet.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast({
          title: "Snippet deleted",
          description: "Your snippet has been deleted.",
        });
        router.push("/snippets");
      } else {
        throw new Error("Failed to delete snippet");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast({
        title: "Error",
        description: "Failed to delete snippet.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/snippets")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{snippet.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Snippet Info Card */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{snippet.userName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant={isStarred ? "default" : "outline"} 
                  size="sm"
                  onClick={handleStar}
                  className="flex items-center gap-1"
                >
                  <StarIcon className="h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
                  <span>{starCount}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>
                
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={handleDeleteSnippet}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm">
                {snippet.language}
              </span>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="400px"
                language={snippet.language}
                value={snippet.code}
                theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  fontFamily: '"Geist Mono", monospace',
                }}
              />
            </div>
          </Card>
          
          {/* Comments Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </h2>
            
            <div className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                className="mb-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button 
                onClick={handleSubmitComment} 
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "Submitting..." : "Submit Comment"}
              </Button>
            </div>
            
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {comment.userId === currentUser.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4">About this snippet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This code snippet was created by {snippet.userName} 
              {snippet.createdAt && ` on ${new Date(snippet.createdAt).toLocaleDateString()}`}.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium">{snippet.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Comments:</span>
                <span>{comments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stars:</span>
                <span>{starCount}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-medium mb-4">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={handleCopyCode}>
                <Clipboard className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              <Button className="w-full justify-start" variant="outline" onClick={handleStar}>
                <StarIcon className="h-4 w-4 mr-2" fill={isStarred ? "currentColor" : "none"} />
                {isStarred ? "Unstar Snippet" : "Star Snippet"}
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => router.push(`/execute?language=${snippet.language}&code=${encodeURIComponent(snippet.code)}`)}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Try It Yourself
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}