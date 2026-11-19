import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth/client";
import { TurnstileWidget } from "./TurnstileWidget";

const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

export function SignUpForm() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!name || !email || password.length < 8) {
      setError(
        "Enter your name, a valid email, and a password of 8+ characters."
      );
      return;
    }
    if (!token) {
      setError("Complete the verification challenge, then try again.");
      return;
    }
    setPending(true);
    const { error: signUpError } = await authClient.signUp.email(
      { name, email, password, callbackURL: "/settings/sessions" },
      {
        headers: { "x-captcha-response": token },
        onSuccess: () => setSent(true),
        onError: (ctx) => setError(ctx.error.message),
      }
    );
    setPending(false);
    if (signUpError) setError(signUpError.message ?? "Something went wrong.");
  }

  if (sent) {
    return (
      <Alert>
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account was created, a verification link is on its way. It
          expires after one hour and can only be used once.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Create account">
      <Field>
        <FieldLabel htmlFor="signup-name">Name</FieldLabel>
        <Input id="signup-name" name="name" autoComplete="name" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signup-password">Password</FieldLabel>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
          <AlertTitle>Could not create your account</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending || !siteKey} className="mt-4">
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
