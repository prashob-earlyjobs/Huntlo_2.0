/** Mailbox bounce / DSN. These are not candidate replies. */
export function isMailDeliveryFailure(input: {
  from?: string | null;
  subject?: string | null;
  bodyText?: string | null;
}): boolean {
  const from = String(input.from || '').toLowerCase();
  const subject = String(input.subject || '');
  const body = String(input.bodyText || '');
  if (/\b(mailer-daemon|postmaster|mail delivery subsystem)\b/.test(from)) return true;
  if (
    /undelivered mail|delivery status notification|mail delivery (failed|subsystem)|returned to sender|failure notice/i.test(
      subject
    )
  ) {
    return true;
  }
  return /created automatically by mail delivery software|delivery to the following recipient failed|address not found|user unknown/i.test(
    body
  );
}
