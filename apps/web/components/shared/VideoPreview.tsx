"use client";

import { useState, useRef } from "react";

type VideoPreviewProps = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
};

export function VideoPreview({ src, poster, title, className = "" }: VideoPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function toggle() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#1D1D1F] ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        controls={playing}
        onEnded={() => setPlaying(false)}
        className="w-full aspect-video object-cover"
        aria-label={title ?? "Preview video"}
      />
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Putar preview: ${title ?? "video"}`}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
        >
          <span className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-[#1D1D1F] ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
