// Bengali digit + relative-time formatting (Dhaka timezone display).

const BN = "০১২৩৪৫৬৭৮৯";

export function bnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN[Number(d)]);
}

export function timeAgoBn(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${bnDigits(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${bnDigits(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${bnDigits(days)} দিন আগে`;
  return dateBn(date);
}

export function dateBn(date: Date): string {
  const s = date.toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s;
}

export function timeBn(date: Date): string {
  return date.toLocaleTimeString("bn-BD", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
  });
}

// English equivalents for the sat (South Asia Today) brand. The Bengali
// functions above are unchanged and still used by pp/btn.

export function timeAgoEn(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return dateEn(date);
}

export function dateEn(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function timeEn(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgoFor(lang: "bn" | "en", date: Date): string {
  return lang === "en" ? timeAgoEn(date) : timeAgoBn(date);
}

export function dateFor(lang: "bn" | "en", date: Date): string {
  return lang === "en" ? dateEn(date) : dateBn(date);
}

export type PostCardItem = {
  id: number;
  headline: string;
  category: string;
  imageId: number | null;
  publishedAt: Date;
};
