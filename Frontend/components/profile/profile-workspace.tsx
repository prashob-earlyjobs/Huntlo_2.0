"use client";

import {
  Camera,
  LogOut,
  Monitor,
  Moon,
  Shield,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { authApi, getApiErrorMessage, profileApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

import { Field } from "@/components/outreach/builder-ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormSaveBar, type FormSaveStatus } from "@/components/shared/form-save-bar";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_APPEARANCE,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PERSONAL,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  PROFILE_TIMEZONES,
  type ActiveSession,
  type AppearancePrefs,
  type DensityPreference,
  type NotificationChannel,
  type NotificationEventId,
  type NotificationPrefs,
  type ProfilePersonal,
  type ThemePreference,
} from "@/lib/mock-profile";
import { cn } from "@/lib/utils";

function clonePersonal(value: ProfilePersonal): ProfilePersonal {
  return { ...value };
}

function cloneNotifications(value: NotificationPrefs): NotificationPrefs {
  return Object.fromEntries(
    Object.entries(value).map(([key, channels]) => [key, { ...channels }])
  );
}

function personalEqual(a: ProfilePersonal, b: ProfilePersonal) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function notificationsEqual(a: NotificationPrefs, b: NotificationPrefs) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function appearanceEqual(a: AppearancePrefs, b: AppearancePrefs) {
  return a.theme === b.theme && a.density === b.density;
}

function useSimulatedSave() {
  const [status, setStatus] = useState<FormSaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function runSave(options?: {
    error?: string;
    onSuccess?: () => void | Promise<void>;
    simulateDelay?: boolean;
  }) {
    setStatus("saving");
    setErrorMessage(undefined);

    if (options?.error) {
      setStatus("error");
      setErrorMessage(options.error);
      return;
    }

    const run = async () => {
      await options?.onSuccess?.();
      setStatus("success");
    };

    if (options?.simulateDelay === false) {
      void run().catch((error) => {
        setStatus("error");
        setErrorMessage(getApiErrorMessage(error, "Save failed"));
      });
      return;
    }

    window.setTimeout(() => {
      void run().catch((error) => {
        setStatus("error");
        setErrorMessage(getApiErrorMessage(error, "Save failed"));
      });
    }, 700);
  }

  function clearStatus() {
    setStatus("idle");
    setErrorMessage(undefined);
  }

  return { status, errorMessage, runSave, clearStatus };
}

/* ------------------------------------------------------------------ */
/* Profile photo                                                        */
/* ------------------------------------------------------------------ */

function ProfilePhoto({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden
        className="relative flex size-20 items-center justify-center rounded-full border border-border bg-brand-subtle text-xl font-semibold text-primary"
      >
        {initials}
        <span className="absolute inset-x-0 bottom-0 flex justify-center">
          <span className="rounded-t-md bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Camera aria-hidden className="inline size-3" />
          </span>
        </span>
      </span>
      <div className="space-y-1.5">
        <Button type="button" size="sm" variant="outline" disabled>
          Upload photo
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG or PNG · max 2 MB · placeholder only
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notification matrix                                                  */
/* ------------------------------------------------------------------ */

function NotificationMatrix({
  value,
  onChange,
}: {
  value: NotificationPrefs;
  onChange: (next: NotificationPrefs) => void;
}) {
  function toggle(eventId: NotificationEventId, channel: NotificationChannel) {
    onChange({
      ...value,
      [eventId]: {
        ...value[eventId],
        [channel]: !value[eventId][channel],
      },
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Event
            </th>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <th
                key={channel.id}
                className="px-3 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {channel.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NOTIFICATION_EVENTS.map((event) => (
            <tr key={event.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5">
                <p className="font-medium text-foreground">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {event.description}
                </p>
              </td>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <td key={channel.id} className="px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    aria-label={`${event.label} · ${channel.label}`}
                    checked={value[event.id][channel.id]}
                    onChange={() => toggle(event.id, channel.id)}
                    className="size-3.5 accent-primary"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Appearance                                                           */
/* ------------------------------------------------------------------ */

function ThemeOption({
  value,
  selected,
  label,
  icon: Icon,
  onSelect,
}: {
  value: ThemePreference;
  selected: boolean;
  label: string;
  icon: typeof Sun;
  onSelect: (value: ThemePreference) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors",
        selected
          ? "border-primary bg-brand-subtle/40 text-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted/40"
      )}
    >
      <Icon aria-hidden className="size-4" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function ProfileWorkspace() {
  const { setTheme } = useTheme();
  const { user, refresh, isMockMode } = useAuth();

  const [savedPersonal, setSavedPersonal] = useState(() =>
    clonePersonal(DEFAULT_PERSONAL)
  );
  const [personal, setPersonal] = useState(() => clonePersonal(DEFAULT_PERSONAL));

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [savedNotifications, setSavedNotifications] = useState(() =>
    cloneNotifications(DEFAULT_NOTIFICATIONS)
  );
  const [notifications, setNotifications] = useState(() =>
    cloneNotifications(DEFAULT_NOTIFICATIONS)
  );

  const [savedAppearance, setSavedAppearance] = useState({
    ...DEFAULT_APPEARANCE,
  });
  const [appearance, setAppearance] = useState({ ...DEFAULT_APPEARANCE });

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [signOutPassword, setSignOutPassword] = useState("");

  const personalSave = useSimulatedSave();
  const passwordSave = useSimulatedSave();
  const notificationSave = useSimulatedSave();
  const appearanceSave = useSimulatedSave();

  const personalDirty = !personalEqual(personal, savedPersonal);
  const passwordDirty =
    password.current.length > 0 ||
    password.next.length > 0 ||
    password.confirm.length > 0;
  const notificationsDirty = !notificationsEqual(
    notifications,
    savedNotifications
  );
  const appearanceDirty = !appearanceEqual(appearance, savedAppearance);

  useEffect(() => {
    if (!user) return;
    const nextPersonal: ProfilePersonal = {
      firstName: user.firstName ?? user.name.split(" ")[0] ?? "",
      lastName: user.lastName ?? user.name.split(" ").slice(1).join(" ") ?? "",
      email: user.email,
      phone: user.phone ?? "",
      jobTitle: user.jobTitle ?? "",
      timezone: user.timezone ?? DEFAULT_PERSONAL.timezone,
      initials: user.initials,
    };
    setSavedPersonal(clonePersonal(nextPersonal));
    setPersonal(clonePersonal(nextPersonal));
  }, [user]);

  useEffect(() => {
    if (isMockMode) {
      setSessions([
        {
          id: "s1",
          device: "Chrome on macOS · Bangalore",
          location: "Bengaluru, IN",
          lastActive: "Active now",
          current: true,
        },
      ]);
      return;
    }
    void Promise.all([
      profileApi.getPreferences(),
      profileApi.listSessions(),
    ])
      .then(([prefs, nextSessions]) => {
        const appearanceNext = {
          theme: prefs.appearance?.theme ?? prefs.theme,
          density: prefs.appearance?.density ?? prefs.density,
        };
        setAppearance(appearanceNext);
        setSavedAppearance(appearanceNext);
        setTheme(appearanceNext.theme);
        if (prefs.notificationPreferences) {
          setNotifications(cloneNotifications(prefs.notificationPreferences));
          setSavedNotifications(cloneNotifications(prefs.notificationPreferences));
        }
        setSessions(
          nextSessions.map((session) => ({
            id: session.id,
            device: session.device,
            location: session.location,
            lastActive: session.lastActive,
            current: session.current,
          }))
        );
      })
      .catch(() => {
        // Keep defaults when preferences are unavailable.
      });
  }, [isMockMode, setTheme]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function updatePersonal<K extends keyof ProfilePersonal>(
    key: K,
    value: ProfilePersonal[K]
  ) {
    personalSave.clearStatus();
    setPersonal((previous) => ({ ...previous, [key]: value }));
  }

  function savePersonal() {
    if (
      !personal.firstName.trim() ||
      !personal.lastName.trim() ||
      !personal.email.trim() ||
      !personal.email.includes("@")
    ) {
      personalSave.runSave({
        error:
          "Could not save profile — first name, last name and a valid email are required.",
      });
      return;
    }

    personalSave.runSave({
      simulateDelay: isMockMode,
      onSuccess: async () => {
        if (isMockMode) {
          setSavedPersonal(clonePersonal(personal));
          return;
        }
        await authApi.updateMe({
          firstName: personal.firstName,
          lastName: personal.lastName,
          phone: personal.phone || null,
          jobTitle: personal.jobTitle || null,
          timezone: personal.timezone,
        });
        await refresh();
        setSavedPersonal(clonePersonal(personal));
      },
    });
  }

  function savePassword() {
    if (!password.current || !password.next || !password.confirm) {
      passwordSave.runSave({
        error: "Fill in current, new and confirm password.",
      });
      return;
    }
    if (password.next !== password.confirm) {
      passwordSave.runSave({
        error: "New password and confirmation do not match.",
      });
      return;
    }
    if (password.next.length < 8) {
      passwordSave.runSave({
        error: "New password must be at least 8 characters.",
      });
      return;
    }
    passwordSave.runSave({
      simulateDelay: isMockMode,
      onSuccess: async () => {
        if (!isMockMode) {
          await profileApi.changePassword({
            currentPassword: password.current,
            newPassword: password.next,
          });
        }
        setPassword({ current: "", next: "", confirm: "" });
      },
    });
  }

  function saveNotifications() {
    notificationSave.runSave({
      simulateDelay: isMockMode,
      onSuccess: async () => {
        if (!isMockMode) {
          await profileApi.updatePreferences({
            notificationPreferences: notifications,
          });
        }
        setSavedNotifications(cloneNotifications(notifications));
      },
    });
  }

  function saveAppearance() {
    appearanceSave.runSave({
      simulateDelay: isMockMode,
      onSuccess: async () => {
        if (!isMockMode) {
          await profileApi.updatePreferences({
            appearance,
            theme: appearance.theme,
            density: appearance.density,
          });
        }
        setSavedAppearance({ ...appearance });
        setTheme(appearance.theme);
      },
    });
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      {/* Personal */}
      <FormSection
        title="Personal Information"
        description="How you appear across Huntlo and candidate communications"
      >
        <ProfilePhoto
          initials={`${personal.firstName[0] ?? ""}${personal.lastName[0] ?? ""}`.toUpperCase() || personal.initials}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" htmlFor="first-name" required>
            <Input
              id="first-name"
              value={personal.firstName}
              onChange={(event) =>
                updatePersonal("firstName", event.target.value)
              }
            />
          </Field>
          <Field label="Last name" htmlFor="last-name" required>
            <Input
              id="last-name"
              value={personal.lastName}
              onChange={(event) =>
                updatePersonal("lastName", event.target.value)
              }
            />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={personal.email}
              onChange={(event) => updatePersonal("email", event.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              value={personal.phone}
              onChange={(event) => updatePersonal("phone", event.target.value)}
            />
          </Field>
          <Field label="Job title" htmlFor="job-title">
            <Input
              id="job-title"
              value={personal.jobTitle}
              onChange={(event) =>
                updatePersonal("jobTitle", event.target.value)
              }
            />
          </Field>
          <Field label="Timezone" htmlFor="timezone">
            <Select
              value={personal.timezone}
              onValueChange={(value) => {
                if (!value) return;
                personalSave.clearStatus();
                updatePersonal("timezone", value);
              }}
            >
              <SelectTrigger id="timezone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <FormSaveBar
          dirty={personalDirty}
          status={personalSave.status}
          errorMessage={personalSave.errorMessage}
          successMessage="Personal information saved."
          onSave={savePersonal}
          onReset={() => {
            setPersonal(clonePersonal(savedPersonal));
            personalSave.clearStatus();
          }}
        />
      </FormSection>

      {/* Password */}
      <FormSection
        title="Password and Security"
        description="Update your password and manage signed-in devices"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Current password" htmlFor="current-password">
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={password.current}
              onChange={(event) => {
                passwordSave.clearStatus();
                setPassword((previous) => ({
                  ...previous,
                  current: event.target.value,
                }));
              }}
              placeholder="••••••••"
            />
          </Field>
          <Field label="New password" htmlFor="new-password">
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password.next}
              onChange={(event) => {
                passwordSave.clearStatus();
                setPassword((previous) => ({
                  ...previous,
                  next: event.target.value,
                }));
              }}
              placeholder="Min. 8 characters"
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm-password">
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={password.confirm}
              onChange={(event) => {
                passwordSave.clearStatus();
                setPassword((previous) => ({
                  ...previous,
                  confirm: event.target.value,
                }));
              }}
              placeholder="Repeat new password"
            />
          </Field>
        </div>
        <FormSaveBar
          dirty={passwordDirty}
          status={passwordSave.status}
          errorMessage={passwordSave.errorMessage}
          successMessage="Password updated."
          onSave={savePassword}
          onReset={() => {
            setPassword({ current: "", next: "", confirm: "" });
            passwordSave.clearStatus();
          }}
        />

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-medium text-foreground">
                Active sessions
              </h4>
              <p className="text-xs text-muted-foreground">
                Devices currently signed in to your Huntlo account
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button type="button" size="sm" variant="outline">
                  <LogOut aria-hidden />
                  Sign out all sessions
                </Button>
              }
              title="Sign out all other sessions?"
              description="Enter your password to end every active session except this browser."
              confirmLabel="Sign out all"
              destructive
              onConfirm={async () => {
                if (isMockMode) {
                  setSessions((previous) =>
                    previous.filter((session) => session.current)
                  );
                  setToast("Signed out of other sessions.");
                  return;
                }
                if (!signOutPassword.trim()) {
                  setToast("Enter your current password to sign out other sessions.");
                  return;
                }
                try {
                  await profileApi.revokeOtherSessions(signOutPassword);
                  const nextSessions = await profileApi.listSessions();
                  setSessions(
                    nextSessions.map((session) => ({
                      id: session.id,
                      device: session.device,
                      location: session.location,
                      lastActive: session.lastActive,
                      current: session.current,
                    }))
                  );
                  setSignOutPassword("");
                  setToast("Signed out of other sessions.");
                } catch (error) {
                  setToast(
                    getApiErrorMessage(error, "Unable to sign out other sessions.")
                  );
                }
              }}
            />
          </div>
          {!isMockMode ? (
            <Field label="Confirm password for sign-out all" htmlFor="signout-password">
              <Input
                id="signout-password"
                type="password"
                autoComplete="current-password"
                value={signOutPassword}
                onChange={(event) => setSignOutPassword(event.target.value)}
                placeholder="Current password"
              />
            </Field>
          ) : null}
          <ul className="divide-y divide-border rounded-lg border border-border">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {session.device}
                    {session.current ? (
                      <span className="ml-2 inline-flex rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">
                        This device
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
                {!session.current ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      void (async () => {
                        if (isMockMode) {
                          setSessions((previous) =>
                            previous.filter((item) => item.id !== session.id)
                          );
                          setToast("Session ended.");
                          return;
                        }
                        try {
                          await profileApi.revokeSession(session.id);
                          setSessions((previous) =>
                            previous.filter((item) => item.id !== session.id)
                          );
                          setToast("Session ended.");
                        } catch (error) {
                          setToast(
                            getApiErrorMessage(error, "Unable to end session.")
                          );
                        }
                      })();
                    }}
                  >
                    End
                  </Button>
                ) : (
                  <Shield
                    aria-hidden
                    className="size-4 text-muted-foreground"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </FormSection>

      {/* Notifications */}
      <FormSection
        title="Notification Preferences"
        description="Choose which events reach you and on which channels"
      >
        <NotificationMatrix
          value={notifications}
          onChange={(next) => {
            notificationSave.clearStatus();
            setNotifications(next);
          }}
        />
        <FormSaveBar
          dirty={notificationsDirty}
          status={notificationSave.status}
          successMessage="Notification preferences saved."
          onSave={saveNotifications}
          onReset={() => {
            setNotifications(cloneNotifications(savedNotifications));
            notificationSave.clearStatus();
          }}
        />
      </FormSection>

      {/* Appearance */}
      <FormSection
        title="Appearance"
        description="Theme and density for your Huntlo workspace"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ThemeOption
              value="light"
              selected={appearance.theme === "light"}
              label="Light"
              icon={Sun}
              onSelect={(value) => {
                appearanceSave.clearStatus();
                setAppearance((previous) => ({ ...previous, theme: value }));
              }}
            />
            <ThemeOption
              value="dark"
              selected={appearance.theme === "dark"}
              label="Dark"
              icon={Moon}
              onSelect={(value) => {
                appearanceSave.clearStatus();
                setAppearance((previous) => ({ ...previous, theme: value }));
              }}
            />
            <ThemeOption
              value="system"
              selected={appearance.theme === "system"}
              label="System"
              icon={Monitor}
              onSelect={(value) => {
                appearanceSave.clearStatus();
                setAppearance((previous) => ({ ...previous, theme: value }));
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Density</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(
              [
                {
                  id: "comfortable" as DensityPreference,
                  label: "Comfortable density",
                  hint: "More spacing in tables and lists",
                },
                {
                  id: "compact" as DensityPreference,
                  label: "Compact density",
                  hint: "Denser rows for power users",
                },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  appearanceSave.clearStatus();
                  setAppearance((previous) => ({
                    ...previous,
                    density: option.id,
                  }));
                }}
                className={cn(
                  "flex flex-1 flex-col items-start rounded-lg border px-3 py-3 text-left transition-colors",
                  appearance.density === option.id
                    ? "border-primary bg-brand-subtle/40"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <FormSaveBar
          dirty={appearanceDirty}
          status={appearanceSave.status}
          successMessage="Appearance preferences saved."
          onSave={saveAppearance}
          onReset={() => {
            setAppearance({ ...savedAppearance });
            appearanceSave.clearStatus();
          }}
        />
      </FormSection>
    </div>
  );
}
