import { Lock, Play } from "lucide-react";
import type { Chapter } from "@/lib/e-course/types";
import { formatDurationShort } from "@/lib/e-course/utils";

type VideoChapterItemProps = {
  chapter: Chapter;
  index: number;
};

export function VideoChapterItem({ chapter, index }: VideoChapterItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#141414] border border-[#1f1f1f] hover:border-[#262626] transition-colors">
      {/* Index */}
      <span className="flex-none w-6 text-center text-[#3a3a3a] text-xs font-mono">
        {(index + 1).toString().padStart(2, "0")}
      </span>

      {/* Thumbnail */}
      <div className="flex-none w-20 aspect-video rounded-md bg-gradient-to-br from-[#0d1a1f] to-[#1a1a1a] border border-[#262626] flex items-center justify-center">
        {chapter.isLocked ? (
          <Lock size={12} className="text-[#3a3a3a]" />
        ) : (
          <Play size={12} className="text-[#00d4ff]" />
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-[#a3a3a3] text-sm leading-snug line-clamp-1">{chapter.title}</p>
      </div>

      {/* Duration + lock */}
      <div className="flex-none flex items-center gap-2">
        <span className="text-[#3a3a3a] text-xs font-mono">
          {formatDurationShort(chapter.durationMinutes)}
        </span>
        {chapter.isLocked && (
          <Lock size={12} className="text-[#3a3a3a]" />
        )}
      </div>
    </div>
  );
}
