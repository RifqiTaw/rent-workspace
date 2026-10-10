import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Primary checkout action; rendered as a disabled button when not ready. */
export function CheckoutLink({
  enabled,
  className,
  label = "Continue to Checkout",
}: {
  enabled: boolean;
  className?: string;
  label?: string;
}) {
  const classes = cn(buttonVariants({ size: "lg" }), "h-11 px-4 text-sm", className);

  if (!enabled) {
    return (
      <Button size="lg" disabled className={classes}>
        {label}
        <ArrowRight data-icon="inline-end" />
      </Button>
    );
  }

  return (
    <Link href="/checkout" className={classes}>
      {label}
      <ArrowRight data-icon="inline-end" />
    </Link>
  );
}
