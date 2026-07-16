import { cn } from "@/lib/utils"

export function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-center overflow-hidden rounded-full bg-muted", className)} {...props} />
}
export function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex h-full w-full items-center justify-center", className)} {...props} />
}
