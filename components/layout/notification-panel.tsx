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
            className="relative"
          />
        }
      >
        <Bell aria-hidden />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
          />
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <Button
            variant="ghost"
            size="xs"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-96">
          <ul>
            {notifications.map((notification) => {
              const Icon = KIND_ICONS[notification.kind];
              return (
                <li
                  key={notification.id}
                  className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <Icon aria-hidden className="size-3.5 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm text-foreground",
                        !notification.read && "font-semibold"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
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
