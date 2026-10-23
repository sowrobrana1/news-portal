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

export type PostCardItem = {
  id: number;
  headline: string;
  category: string;
  imageId: number | null;
  publishedAt: Date;
};
