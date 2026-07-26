import { Button, buttonVariants } from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

interface AttractionDialogFooterProps {
  googleMapsUrl: string;
}

export function AttractionDialogFooter({
  googleMapsUrl,
}: AttractionDialogFooterProps) {
  return (
    <footer className="flex shrink-0 flex-col gap-3 rounded-b-2xl border-t border-border bg-muted px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <DialogClose render={<Button variant="outline" />}>
          關閉
        </DialogClose>
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants()}
          >
            在 Google 地圖查看
            <span aria-hidden="true" data-icon="inline-end">↗</span>
          </a>
        )}
      </div>
    </footer>
  );
}
