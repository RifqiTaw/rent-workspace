import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyStatus = "idle" | "copied" | "error";

const RESET_AFTER_MS = 4000;

/** Copies text to the clipboard with announced feedback and a manual fallback. */
export function CopySummaryButton({ text, className }: { text: string; className?: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    clearTimeout(resetTimer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      resetTimer.current = setTimeout(() => setStatus("idle"), RESET_AFTER_MS);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button size="lg" onClick={copy} className="h-11 w-full px-4 text-sm">
        {status === "copied" ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {status === "copied" ? "Copied to clipboard" : "Copy Rental Summary"}
      </Button>
      <p
        role="status"
        className={cn(
          "min-h-4 text-xs",
          status === "error" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {status === "copied" && "Rental summary copied. Paste it anywhere to share."}
        {status === "error" &&
          "Couldn't copy automatically. Select the text below and copy it manually."}
      </p>
      {status === "error" && (
        <textarea
          readOnly
          value={text}
          rows={10}
          aria-label="Rental summary text"
          onFocus={(event) => event.currentTarget.select()}
          className="w-full resize-y rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      )}
    </div>
  );
}
