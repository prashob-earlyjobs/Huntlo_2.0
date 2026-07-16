import { cn } from "@/lib/utils"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export function CandidateAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground", className)}>
      {initials(name)}
    </span>
  )
}
