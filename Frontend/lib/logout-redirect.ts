const LAST_LOGOUT_USER_KEY = "huntlo:last-logout-user";

type LogoutUserMarker = {
  id: string;
  email: string | null;
};

function readMarker(): LogoutUserMarker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_LOGOUT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LogoutUserMarker>;
    if (!parsed?.id || typeof parsed.id !== "string") return null;
    return {
      id: parsed.id,
      email: typeof parsed.email === "string" ? parsed.email : null,
    };
  } catch {
    return null;
  }
}

/** Remember who signed out so A→A can restore `?next=`, but A→B goes to Home. */
export function markIntentionalLogout(user: {
  id: string;
  email?: string | null;
}): void {
  if (typeof window === "undefined") return;
  try {
    const marker: LogoutUserMarker = {
      id: user.id,
      email: user.email?.trim().toLowerCase() || null,
    };
    sessionStorage.setItem(LAST_LOGOUT_USER_KEY, JSON.stringify(marker));
  } catch {
    // sessionStorage can throw in private mode; ignore.
  }
}

export function peekLastLogoutUser(): LogoutUserMarker | null {
  return readMarker();
}

/**
 * Compare the account that just signed in with the one that signed out.
 * Clears the marker. `none` = no prior intentional logout in this tab.
 */
export function consumeLogoutAccountChange(nextUser: {
  id: string;
  email?: string | null;
}): "same" | "switched" | "none" {
  const previous = readMarker();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(LAST_LOGOUT_USER_KEY);
    } catch {
      // ignore
    }
  }
  if (!previous) return "none";

  const nextEmail = nextUser.email?.trim().toLowerCase() || null;
  if (
    previous.id === nextUser.id ||
    (previous.email && nextEmail && previous.email === nextEmail)
  ) {
    return "same";
  }
  return "switched";
}
