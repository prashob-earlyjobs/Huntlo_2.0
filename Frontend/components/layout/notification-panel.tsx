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
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
import { getApiErrorMessage, notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

const KIND_ICONS: Record<AppNotification["kind"], LucideIcon> = {
  campaign: Send,
  screening: AudioLines,
  interview: CalendarClock,
  usage: Gauge,
  system: Info,
};

function normalizeNotification(row: AppNotification): AppNotification {
  return {
    ...row,
    description: row.description || row.message || "",
    kind: row.kind || "system",
  };
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const refresh = useCallback(async () => {
    try {
      const rows = await notificationsApi.list({ limit: 30 });
      setNotifications(rows.map(normalizeNotification));
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRealtimeRefresh("notification.created", () => {
    void refresh();
  });

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      setNotifications((previous) =>
        previous.map((notification) => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function markOneRead(id: string) {
    try {
      await notificationsApi.markRead(id);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
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
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0}
          >
            Mark read
          </Button>
        </div>
        {error ? (
          <p role="alert" className="border-b border-border px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
        <ScrollArea className="max-h-80">
          <ul>
            {notifications.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </li>
            ) : (
              notifications.map((notification) => {
                const Icon = KIND_ICONS[notification.kind] ?? Info;
                const body = (
                  <>
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
                  </>
                );

                return (
                  <li
                    key={notification.id}
                    className="border-b border-border last:border-b-0"
                  >
                    {notification.actionUrl ? (
                      <Link
                        href={notification.actionUrl}
                        className="flex gap-2.5 px-3 py-2.5 hover:bg-muted/40"
                        onClick={() => {
                          if (!notification.read) void markOneRead(notification.id);
                        }}
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="flex w-full gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40"
                        onClick={() => {
                          if (!notification.read) void markOneRead(notification.id);
                        }}
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
