import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Square, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const VoiceNoteModal = ({ open, onOpenChange, onSuccess }: VoiceNoteModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [title, setTitle] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setIsRecording(false);
    setIsTranscribing(false);
    setIsSaving(false);
    setTranscription("");
    setTitle("");
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-voice', {
          body: { audio: base64Audio }
        });

        if (error) throw error;
        
        setTranscription(data.text || "");
        if (!title) {
          // Auto-generate title from first few words
          const words = (data.text || "").split(' ').slice(0, 5).join(' ');
          setTitle(words + (words.length < (data.text || "").length ? '...' : ''));
        }
        
        toast({
          title: "Transcription Complete",
          description: "Your voice note has been transcribed successfully.",
        });
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe your voice note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveVoiceNote = async () => {
    if (!title.trim() || !transcription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title and transcription",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("knowledge_base")
        .insert({
          coach_id: user.id,
          title,
          content: transcription,
          file_type: "voice_note",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voice note saved to your knowledge base",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your voice note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>Record Voice Note</DialogTitle>
          <DialogDescription>
            Record your voice and we'll transcribe it to add to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recording Section */}
          <div className="flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-destructive/20 animate-pulse' 
                : 'bg-muted'
            }`}>
              {isRecording ? (
                <div className="text-center">
                  <Mic className="w-8 h-8 text-destructive mx-auto" />
                  <span className="text-sm font-medium mt-1">{formatTime(recordingTime)}</span>
                </div>
              ) : (
                <Mic className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex gap-2">
              {!isRecording && !audioBlob && (
                <Button onClick={startRecording} variant="default">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {isRecording && (
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {audioBlob && !isRecording && !transcription && (
                <>
                  <Button onClick={startRecording} variant="outline">
                    <Mic className="w-4 h-4 mr-2" />
                    Re-record
                  </Button>
                  <Button onClick={transcribeAudio} disabled={isTranscribing}>
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      "Transcribe"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Transcription Section */}
          {transcription && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your voice note"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Transcription</Label>
                <div className="p-3 bg-muted rounded-md text-sm max-h-40 overflow-y-auto">
                  {transcription}
                </div>
              </div>
            </div>
          )}
        </div>

        {transcription && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveVoiceNote} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Voice Note
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
