"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function CandidateAvatar({
  name,
  src,
  className,
}: {
  name: string
  /** Future Jobs `profile_picture_permalink` (or equivalent). */
  src?: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const photo = typeof src === "string" && src.trim() ? src.trim() : null

  if (photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Future Jobs CDN URLs; plain img avoids next/image domain allowlist
      <img
        src={photo}
        alt=""
        className={cn(
          "inline-flex shrink-0 rounded-full object-cover bg-muted",
          className
        )}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
