"use client";

import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Plug, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Must match Backend `GMAIL_SCOPES` (gmail.oauth.ts). */
export const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

function GmailAuthCodeButton({
  label,
  busy,
  reconnect = false,
  onCode,
  onError,
}: {
  label: string;
  busy: boolean;
  reconnect?: boolean;
  onCode: (code: string) => void;
  onError: (message: string) => void;
}) {
  const login = useGoogleLogin({
    flow: "auth-code",
    scope: GMAIL_OAUTH_SCOPES,
    ux_mode: "popup",
    // Ask Google to re-consent so a refresh token is more likely on reconnect.
    ...(reconnect ? { prompt: "consent" as const } : {}),
    onSuccess: (response) => {
      if (response.code) {
        onCode(response.code);
        return;
      }
      onError("Google did not return an authorization code.");
    },
    onError: (error) => {
      onError(
        error.error_description ||
          error.error ||
          "Google authorization was cancelled or failed."
      );
    },
    onNonOAuthError: () => {
      onError("Google sign-in popup was blocked or closed.");
    },
  });

  return (
    <Button
      size="sm"
      variant={reconnect ? "outline" : "default"}
      className="flex-1"
      disabled={busy}
      onClick={() => login()}
    >
      {reconnect ? <RefreshCw aria-hidden /> : <Plug aria-hidden />}
      {busy ? "Connecting…" : label}
    </Button>
  );
}

/** Popup OAuth (auth-code + postmessage) matching backend Gmail exchange. */
export function GmailConnectButton({
  clientId,
  busy,
  reconnect = false,
  onCode,
  onError,
}: {
  clientId: string;
  busy: boolean;
  reconnect?: boolean;
  onCode: (code: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GmailAuthCodeButton
        label={reconnect ? "Reconnect" : "Connect"}
        busy={busy}
        reconnect={reconnect}
        onCode={onCode}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}
