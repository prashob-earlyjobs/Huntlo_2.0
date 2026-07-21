"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  preview = false,
}: {
  name: string
  /** Future Jobs `profile_picture_permalink` (or equivalent). */
  src?: string | null
  className?: string
  preview?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const photo = typeof src === "string" && src.trim() ? src.trim() : null

  if (photo && !failed) {
    const avatar = (
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

    if (preview) {
      return (
        <Dialog>
          <DialogTrigger
            aria-label={`View ${name}'s profile image`}
            className="shrink-0 cursor-zoom-in rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {avatar}
          </DialogTrigger>
          <DialogContent className="w-auto max-w-[calc(100%-2rem)] p-2 sm:max-w-3xl">
            <DialogTitle className="sr-only">{name}&apos;s profile image</DialogTitle>
            <DialogDescription className="sr-only">
              Enlarged profile image for {name}
            </DialogDescription>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Future Jobs CDN URL */}
            <img
              src={photo}
              alt={`${name}'s profile`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
              onError={() => setFailed(true)}
              referrerPolicy="no-referrer"
            />
          </DialogContent>
        </Dialog>
      )
    }

    return (
      avatar
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
