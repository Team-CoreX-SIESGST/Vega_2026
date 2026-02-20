'use client'

import { useRef, useEffect } from "react";

const UnicornBackground = ({ className = "", useVideo = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay may be blocked, video will play on user interaction
      });
    }
  }, []);

  if (useVideo) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Video background */}
        <video
          ref={videoRef}
          src="/videos/futuristic-background.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay to enhance contrast and blend with theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60" />
      </div>
    );
  }

  // Fallback animated background if video not used
  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-background via-card to-background ${className}`}>
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/25 rounded-full blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
};

export default UnicornBackground;