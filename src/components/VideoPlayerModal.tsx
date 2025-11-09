import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

const VideoPlayerModal = ({ isOpen, onClose, videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ" }: VideoPlayerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Syndic.us Platform Demo</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={videoUrl}
            title="Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            See how Syndic.us connects you with AI-powered expert coaches
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
