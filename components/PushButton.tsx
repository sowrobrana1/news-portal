"use client";

import { useEffect, useState } from "react";

// VAPID public keys are base64url; PushManager wants raw bytes.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type State = "idle" | "working" | "on" | "unsupported";

export default function PushButton() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    // If this browser already has a subscription, show the "on" label.
    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((reg) => (reg ? reg.pushManager.getSubscription() : null))
      .then((sub) => {
        if (sub) setState("on");
      })
      .catch(() => {});
  }, []);

  async function enable() {
    if (state === "on" || state === "working" || state === "unsupported") return;
    setState("working");
    try {
      const keyRes = await fetch("/api/push/key");
      const keyData = await keyRes.json();
      if (!keyData.ok || !keyData.publicKey) {
        setState("idle");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("idle");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      const data = await res.json();
      if (data.ok) setState("on");
      else setState("idle");
    } catch {
      setState("idle");
    }
  }

  const label =
    state === "on"
      ? "✓ নোটিফিকেশন চালু আছে"
      : state === "unsupported"
        ? "এই ব্রাউজারে হবে না"
        : state === "working"
          ? "চালু হচ্ছে…"
          : "🔔 নোটিফিকেশন চালু করুন";

  return (
    <button
      type="button"
      onClick={enable}
      aria-label="পুশ নোটিফিকেশন চালু করুন"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 40,
        padding: "0 12px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.35)",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        fontSize: 13,
        whiteSpace: "nowrap",
        cursor: "pointer",
        flex: "none",
      }}
    >
      {label}
    </button>
  );
}
