"use client";

import { Heart } from "lucide-react";
import { toggleCommentLike } from "@/actions/comments";

export function LikeButton({
  commentId,
  path,
  count,
  liked,
  disabled,
}: {
  commentId: string;
  path: string;
  count: number;
  liked: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Heart className="size-3.5" />
        {count}
      </span>
    );
  }
  return (
    <form action={toggleCommentLike.bind(null, commentId, path)}>
      <button
        type="submit"
        className={`inline-flex items-center gap-1 text-xs transition-colors ${
          liked ? "text-red-600 dark:text-red-400" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
        {count}
      </button>
    </form>
  );
}
