// components/session/session-player.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Settings 
} from "lucide-react";
import {
  Slider
} from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for recording events
interface EditorEvent {
  type: 'edit' | 'cursor' | 'selection' | 'file-change';
  timestamp: number;
  userId: string;
  userName: string;
  fileId: string;
  fileName: string;
  content?: string;
  position?: { lineNumber: number; column: number };
  selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
}

interface ChatEvent {
  type: 'chat';
  timestamp: number;
  userId: string;
  userName: string;
  message: string;
}

interface UserEvent {
  type: 'user-joined' | 'user-left';
  timestamp: number;
  userId: string;
  userName: string;
}

type RecordingEvent = EditorEvent | ChatEvent | UserEvent;

interface SessionPlayerProps {
  session: any;
  recording: RecordingEvent[];
}

export default function SessionPlayer({ session, recording }: SessionPlayerProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFileId, setCurrentFileId] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [events, setEvents] = useState<RecordingEvent[]>([]);
  const [duration, setDuration] = useState(0);
  
  const playbackRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Initialize the player when recording data is available
  useEffect(() => {
    if (recording && recording.length > 0) {
      // Sort events by timestamp
      const sortedEvents = [...recording].sort((a, b) => a.timestamp - b.timestamp);
      setEvents(sortedEvents);
      
      // Set duration based on the timestamp of the last event
      const lastEvent = sortedEvents[sortedEvents.length - 1];
      setDuration(lastEvent.timestamp);
      
      // Set initial file and content
      const firstEditEvent = sortedEvents.find(event => 
        event.type === 'edit' || event.type === 'file-change'
      ) as EditorEvent | undefined;
      
      if (firstEditEvent) {
        setCurrentFileId(firstEditEvent.fileId);
        setCurrentContent(firstEditEvent.content || "");
      }
    }
  }, [recording]);
  
  // Handle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      // Pause playback
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
    } else {
      // Start playback from current position
      startTimeRef.current = Date.now() - (currentTime / playbackSpeed);
      startPlayback();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Playback animation frame
  const startPlayback = () => {
    const animate = () => {
      const now = Date.now();
      const elapsedMs = (now - startTimeRef.current) * playbackSpeed;
      
      if (elapsedMs >= duration) {
        // End of recording reached
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }
      
      setCurrentTime(elapsedMs);
      
      // Process events up to current time
      processEventsUpToTime(elapsedMs);
      
      // Continue animation
      playbackRef.current = requestAnimationFrame(animate);
    };
    
    playbackRef.current = requestAnimationFrame(animate);
  };
  
  // Process all events up to the current time
  const processEventsUpToTime = (time: number) => {
    // Find the latest editor content up to the current time
    const editorEvents = events.filter(event => 
      (event.type === 'edit' || event.type === 'file-change') && 
      event.timestamp <= time
    ) as EditorEvent[];
    
    if (editorEvents.length === 0) return;
    
    // Get the latest event for the current file
    const latestEvent = editorEvents
      .filter(event => event.fileId === currentFileId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (latestEvent && latestEvent.content !== undefined) {
      setCurrentContent(latestEvent.content);
    }
  };
  
  // Seek to a specific time
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime);
    
    // If playing, adjust start time to maintain playback from the new position
    if (isPlaying) {
      startTimeRef.current = Date.now() - (seekTime / playbackSpeed);
    }
    
    // Process events up to seek time
    processEventsUpToTime(seekTime);
  };
  
  // Skip forward/backward
  const skipForward = () => {
    const newTime = Math.min(currentTime + 10000, duration);
    setCurrentTime(newTime);
    processEventsUpToTime(newTime);
    
    if (isPlaying) {
      startTimeRef.current = Date.now() - (newTime / playbackSpeed);
    }
  };
  
  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10000, 0);
    setCurrentTime(newTime);
    processEventsUpToTime(newTime);
    
    if (isPlaying) {
      startTimeRef.current = Date.now() - (newTime / playbackSpeed);
    }
  };
  
  // Change playback speed
  const handleSpeedChange = (value: string) => {
    const newSpeed = parseFloat(value);
    
    if (isPlaying) {
      // Adjust start time to maintain correct playback position with new speed
      const currentElapsed = Date.now() - startTimeRef.current;
      const adjustedStartTime = Date.now() - (currentElapsed * (playbackSpeed / newSpeed));
      startTimeRef.current = adjustedStartTime;
    }
    
    setPlaybackSpeed(newSpeed);
  };
  
  // Format time display (mm:ss)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={currentContent}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
          }}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-950 border-t p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={1}
            onValueChange={handleSeek}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" size="icon" onClick={skipBackward}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button onClick={togglePlayback} className="w-20">
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          
          <Button variant="outline" size="icon" onClick={skipForward}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}