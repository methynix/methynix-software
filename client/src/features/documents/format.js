// Formatting helpers shared by forms and PDF templates.

export const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// 1234567 -> "1,234,567"
export const formatTZS = (v) => {
  const n = toNumber(v);
  return n.toLocaleString("en-US");
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

// "2026-07-08" -> "08 / 07 / 2026"
export const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d} / ${m} / ${y}`;
};

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const threeDigits = (num) => {
  let out = "";
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  if (hundred) out += `${ONES[hundred]} Hundred`;
  if (rest) {
    if (out) out += " ";
    if (rest < 20) out += ONES[rest];
    else {
      out += TENS[Math.floor(rest / 10)];
      if (rest % 10) out += ` ${ONES[rest % 10]}`;
    }
  }
  return out;
};

const SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];

// 2300000 -> "Two Million Three Hundred Thousand Shillings Only"
export const amountInWords = (value) => {
  let num = Math.floor(toNumber(value));
  if (num <= 0) return "Zero Shillings Only";

  const groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const words = threeDigits(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }

  return `${parts.join(" ")} Shillings Only`;
};
