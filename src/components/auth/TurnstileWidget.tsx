import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
}: {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const scriptId = useId();

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      try {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            setFailed(false);
            onVerify(token);
          },
          "expired-callback": () => {
            onExpire();
          },
          "error-callback": () => {
            setFailed(true);
            onExpire();
          },
        });
      } catch {
        setFailed(true);
      }
    };
    const existing = document.querySelector(
      'script[data-turnstile-script="1"]'
    );
    if (existing) {
      if (window.turnstile) render();
      else existing.addEventListener("load", render, { once: true });
      return () => {
        cancelled = true;
      };
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "1";
    script.dataset.scriptId = scriptId;
    script.addEventListener("load", render, { once: true });
    script.addEventListener(
      "error",
      () => {
        if (!cancelled) setFailed(true);
      },
      { once: true }
    );
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // Widget already gone; nothing to clean up.
        }
        widgetId.current = null;
      }
    };
    // onVerify/onExpire are stable callbacks from the form; re-render only on siteKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p role="alert" className="notice">
        Bot verification is not configured. Sign-in is unavailable until the
        site key is set.
      </p>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {failed && (
        <p role="alert" className="notice">
          Verification failed to load. Check your connection and reload the page
          to try again.
        </p>
      )}
    </div>
  );
}
