import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { cn } from "@/lib/utils";
import type { ConversationPreviewItem } from "@/lib/types";

export function ConversationPreview({
  conversation,
  className,
}: {
  conversation: ConversationPreviewItem;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-input",
        className
      )}
    >
      <CandidateAvatar name={conversation.candidateName} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm text-foreground",
              conversation.unread ? "font-semibold" : "font-medium"
            )}
          >
            {conversation.candidateName}
          </p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {conversation.time}
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-sm",
            conversation.unread ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {conversation.lastMessage}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <ChannelBadge channel={conversation.channel} />
          {conversation.unread ? (
            <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
          ) : null}
        </div>
      </div>
    </article>
  );
}
