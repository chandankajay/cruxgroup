import { Button } from "../ui/Button";
import { WHATSAPP_ORDER_URL } from "../../lib/env";

export function WhatsAppCta({
  message,
  className,
  label = "Book via WhatsApp — available 24/7",
}: {
  readonly message?: string;
  readonly className?: string;
  readonly label?: string;
}) {
  const href = message
    ? `${WHATSAPP_ORDER_URL}?text=${encodeURIComponent(message)}`
    : WHATSAPP_ORDER_URL;

  return (
    <div className={className}>
      <Button href={href} variant="primary" size="lg" external>
        {label}
      </Button>
    </div>
  );
}
