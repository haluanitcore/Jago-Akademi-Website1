import { Lock, Play } from "lucide-react";
import type { Chapter } from "@/lib/e-course/types";
import { formatDurationShort } from "@/lib/e-course/utils";

type VideoChapterItemProps = {
  chapter: Chapter;
  index: number;
};

export function VideoChapterItem({ chapter, index }: VideoChapterItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E5E5E5] hover:border-[rgba(0,119,168,0.2)] shadow-e1 transition-colors">
      {/* Index */}
      <span className="flex-none w-6 text-center text-[#AEAEB2] text-xs font-mono">
        {(index + 1).toString().padStart(2, "0")}
      </span>

      {/* Thumbnail */}
      <div className="flex-none w-20 aspect-video rounded-md bg-gradient-to-br from-[rgba(0,119,168,0.06)] to-[rgba(0,119,168,0.02)] border border-[#E5E5E5] flex items-center justify-center">
        {chapter.isLocked ? (
          <Lock size={12} className="text-[#AEAEB2]" />
        ) : (
          <Play size={12} className="text-[#0077A8]" />
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-[#636366] text-sm leading-snug line-clamp-1">{chapter.title}</p>
      </div>

      {/* Duration + lock */}
      <div className="flex-none flex items-center gap-2">
        <span className="text-[#AEAEB2] text-xs font-mono">
          {formatDurationShort(chapter.durationMinutes)}
        </span>
        {chapter.isLocked && (
          <Lock size={12} className="text-[#AEAEB2]" />
        )}
      </div>
    </div>
  );
}
