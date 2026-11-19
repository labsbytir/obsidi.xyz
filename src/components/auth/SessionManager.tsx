import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";

interface Session {
  id: string;
  token: string;
  createdAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const [{ data: current }, { data: listed, error: listError }] =
      await Promise.all([authClient.getSession(), authClient.listSessions()]);
    if (listError) {
      setError(listError.message ?? "Something went wrong.");
      setSessions([]);
      return;
    }
    setCurrentId(current?.session?.id ?? null);
    setSessions((listed ?? []) as Session[]);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function revoke(token: string) {
    setWorking(token);
    setError(null);
    const { error: revokeError } = await authClient.revokeSession({ token });
    setWorking(null);
    if (revokeError) {
      setError(revokeError.message ?? "Something went wrong.");
      return;
    }
    await refresh();
  }

  async function revokeOthers() {
    setWorking("others");
    setError(null);
    const { error: revokeError } = await authClient.revokeSessions();
    setWorking(null);
    if (revokeError) {
      setError(revokeError.message ?? "Something went wrong.");
      return;
    }
    await refresh();
  }

  async function signOut() {
    setWorking("signout");
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
    setWorking(null);
  }

  if (sessions === null) {
    return (
      <div aria-label="Loading sessions">
        <Skeleton className="mb-2 h-11" />
        <Skeleton className="h-11" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Session unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {sessions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No active sessions</EmptyTitle>
            <EmptyDescription>
              Sign in again to create a new session.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul>
          {sessions.map((session) => {
            const isCurrent = currentId !== null && session.id === currentId;
            return (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"
              >
                <div className="text-sm">
                  <p>
                    {session.userAgent ?? "Unknown device"}
                    {isCurrent && (
                      <Badge variant="outline" className="ml-2">
                        This device
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {session.ipAddress ?? "Unknown location"} · signed in{" "}
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!isCurrent && (
                  <Button
                    variant="outline"
                    disabled={working === session.token}
                    onClick={() => void revoke(session.token)}
                  >
                    {working === session.token ? "Revoking…" : "Revoke"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="actions mt-6">
        <Button
          variant="outline"
          disabled={working === "others"}
          onClick={() => void revokeOthers()}
        >
          {working === "others" ? "Revoking…" : "Sign out other devices"}
        </Button>
        <Button
          variant="outline"
          disabled={working === "signout"}
          onClick={() => void signOut()}
        >
          {working === "signout" ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
