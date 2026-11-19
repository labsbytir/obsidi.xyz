import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth/client";
import { TurnstileWidget } from "./TurnstileWidget";

const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

export function ForgotPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) {
      setError("Enter the email address for your account.");
      return;
    }
    if (!token) {
      setError("Complete the verification challenge, then try again.");
      return;
    }
    setPending(true);
    const { error: resetError } = await authClient.requestPasswordReset(
      { email, redirectTo: "/reset-password" },
      {
        headers: { "x-captcha-response": token },
        onSuccess: () => setSent(true),
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    setPending(false);
    if (resetError) setError(resetError.message ?? "Something went wrong.");
  }

  if (sent) {
    return (
      <Alert>
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account uses that address, a reset link is on its way. It
          expires after one hour and can only be used once.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Request password reset">
      <Field>
        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <div className="my-4">
        <TurnstileWidget
          siteKey={siteKey}
          onVerify={setToken}
          onExpire={() => setToken(null)}
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not send a reset link</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending || !siteKey} className="mt-4">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password.length < 8) {
      setError("Choose a password of 8+ characters.");
      return;
    }
    setPending(true);
    const { error: resetError } = await authClient.resetPassword(
      { newPassword: password, token },
      {
        onSuccess: () => setDone(true),
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    setPending(false);
    if (resetError) setError(resetError.message ?? "Something went wrong.");
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid reset link</AlertTitle>
        <AlertDescription>
          This link is missing its token. Request a new one from{" "}
          <a href="/forgot-password">forgot password</a>.
        </AlertDescription>
      </Alert>
    );
  }

  if (done) {
    return (
      <Alert>
        <AlertTitle>Password updated</AlertTitle>
        <AlertDescription>
          <a href="/sign-in">Sign in</a> with your new password.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Choose a new password">
      <Field>
        <FieldLabel htmlFor="reset-password">New password</FieldLabel>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not update your password</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="mt-4">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
