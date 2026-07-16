"use client";

import {
  AudioLines,
  Bell,
  CalendarClock,
  Gauge,
  Info,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const KIND_ICONS: Record<AppNotification["kind"], LucideIcon> = {
  campaign: Send,
  screening: AudioLines,
  interview: CalendarClock,
  usage: Gauge,
  system: Info,
};

export function NotificationPanel() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function markAllRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true }))
    );
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    unreadCount > 0
                      ? `Notifications, ${unreadCount} unread`
                      : "Notifications"
                  }
                  className="relative text-muted-foreground hover:text-foreground"
                />
              }
            />
          }
        >
          <Bell aria-hidden />
          {unreadCount > 0 ? (
            <span
              aria-hidden
              className="absolute top-2 right-2 size-1.5 rounded-full bg-primary"
            />
          ) : null}
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Notifications</p>
          <Button
            variant="ghost"
            size="xs"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          <ul>
            {notifications.map((notification) => {
              const Icon = KIND_ICONS[notification.kind];
              return (
                <li
                  key={notification.id}
                  className="flex gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0"
                >
                  <Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13px] leading-snug text-foreground",
                        !notification.read && "font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read ? (
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
