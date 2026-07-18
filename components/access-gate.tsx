"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "checking" | "locked" | "unlocked";

/**
 * Wraps the app in a passcode gate. The real check lives server-side in
 * middleware; this only decides what to render and lets the user unlock.
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/unlock")
      .then((res) => res.json())
      .then((data: { required?: boolean; unlocked?: boolean }) => {
        if (!active) return;
        setStatus(data.required && !data.unlocked ? "locked" : "unlocked");
      })
      .catch(() => {
        if (active) setStatus("locked");
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setCode("");
        setStatus("unlocked");
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Something went wrong. Try again.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "unlocked") return <>{children}</>;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      {status === "checking" ? (
        <p className="text-sm text-muted-foreground">Checking access...</p>
      ) : (
        <form
          onSubmit={submit}
          className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-card-foreground">
              ChatPro
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the access code to start chatting.
            </p>
          </div>
          <Input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Access code"
            autoFocus
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            disabled={submitting}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !code.trim()}
          >
            {submitting ? "Unlocking..." : "Unlock"}
          </Button>
        </form>
      )}
    </div>
  );
}
