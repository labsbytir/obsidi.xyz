import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth/client";
import { TurnstileWidget } from "./TurnstileWidget";

const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

export function SignInForm() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (!token) {
      setError("Complete the verification challenge, then try again.");
      return;
    }
    setPending(true);
    const { error: signInError } = await authClient.signIn.email(
      { email, password, callbackURL: "/settings/sessions" },
      {
        headers: { "x-captcha-response": token },
        onSuccess: () => {
          window.location.href = "/settings/sessions";
        },
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    setPending(false);
    if (signInError) setError(signInError.message ?? "Something went wrong.");
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Sign in">
      <Field>
        <FieldLabel htmlFor="signin-email">Email</FieldLabel>
        <Input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signin-password">Password</FieldLabel>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
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
          <AlertTitle>Could not sign you in</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending || !siteKey} className="mt-4">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="notice">
        <a href="/forgot-password">Forgot your password?</a>
      </p>
    </form>
  );
}
