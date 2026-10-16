const DEFAULT_NUMBER = "233557843743";
const GHANA_CODE = "233";

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_NUMBER;

/** "233557843743" -> "055 784 3743" */
export const whatsappDisplayNumber = `0${whatsappNumber.slice(GHANA_CODE.length)}`.replace(
  /^(\d{3})(\d{3})(\d+)$/,
  "$1 $2 $3",
);

export const whatsappHours = "Mon–Fri, 9am–7pm";

export const generalTopics = [
  "Is this item in stock?",
  "Delivery to my area",
  "Help choosing a product",
];

export const homeTopics = ["Ask about a product", "Delivery to my area", "Paying with Mobile Money"];

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
