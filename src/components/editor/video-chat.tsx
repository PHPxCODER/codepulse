// components/editor/video-chat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoChat() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState([
    { id: 'self', name: 'You', image: null, muted: false, videoOff: false }
  ]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Request user media when component mounts
    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
        
        // Display local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // In a real implementation, you would:
        // 1. Set up WebRTC connections
        // 2. Create a signaling service using Socket.io
        // 3. Connect to other peers
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast({
          title: "Camera/Microphone Access Error",
          description: "Please check your device permissions.",
          variant: "destructive"
        });
        
        // If media access fails, update UI
        setIsVideoEnabled(false);
        if (err instanceof Error && err.name === "NotAllowedError") {
          setIsAudioEnabled(false);
        }
      }
    };

    setupLocalStream();

    // Clean up function
    return () => {
      // Stop all tracks when component unmounts
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTracks = stream.getAudioTracks();
      
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      
      setIsAudioEnabled(!isAudioEnabled);
      
      // Update participant list
      setParticipants(prev => 
        prev.map(p => p.id === 'self' ? { ...p, muted: !isAudioEnabled } : p)
      );
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      
      setIsVideoEnabled(!isVideoEnabled);
      
      // Update participant list
      setParticipants(prev => 
        prev.map(p => p.id === 'self' ? { ...p, videoOff: !isVideoEnabled } : p)
      );
    }
  };

  const endCall = () => {
    // Stop media tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // In a real app, you would also disconnect from the WebRTC session
    toast({
      title: "Call Ended",
      description: "You have left the video chat.",
    });
  };

  // Mock function to simulate adding a participant (in a real app, this would come from WebRTC)
  const addMockParticipant = () => {
    const newParticipant = {
      id: `user-${Date.now()}`,
      name: `User ${participants.length}`,
      image: null,
      muted: Math.random() > 0.5,
      videoOff: Math.random() > 0.5
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    
    toast({
      title: "New Participant",
      description: `${newParticipant.name} has joined the session.`,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 gap-4 overflow-x-auto">
        {/* Local video preview */}
        <div className="relative min-w-[200px] h-44 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-700 text-white">
              <Avatar className="h-20 w-20">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-gray-900/50 px-2 py-1 rounded-md text-white text-sm flex items-center">
            <span>You</span>
            {!isAudioEnabled && <MicOff className="h-3 w-3 ml-1 text-red-500" />}
          </div>
        </div>

        {/* Other participants would go here */}
        {participants.filter(p => p.id !== 'self').map(participant => (
          <div key={participant.id} className="relative min-w-[200px] h-44 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {!participant.videoOff ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-700 to-purple-700" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-700 text-white">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-gray-900/50 px-2 py-1 rounded-md text-white text-sm flex items-center">
              <span>{participant.name}</span>
              {participant.muted && <MicOff className="h-3 w-3 ml-1 text-red-500" />}
            </div>
          </div>
        ))}

        {/* Mock participant placeholder (for demo) */}
        {participants.length === 1 && (
          <div 
            className="min-w-[200px] h-44 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={addMockParticipant}
          >
            <div className="text-center p-4">
              <p className="text-sm text-gray-500">No participants yet</p>
              <p className="text-xs text-gray-400">(Click to add a mock participant)</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4 flex items-center justify-center gap-2">
        <Button 
          variant={isAudioEnabled ? "default" : "outline"} 
          size="icon" 
          onClick={toggleAudio}
          className={isAudioEnabled ? "" : "text-red-500"}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant={isVideoEnabled ? "default" : "outline"} 
          size="icon" 
          onClick={toggleVideo}
          className={isVideoEnabled ? "" : "text-red-500"}
        >
          {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button variant="destructive" size="icon" onClick={endCall}>
          <PhoneOff className="h-5 w-5" />
        </Button>
        
        <Button variant="outline" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}