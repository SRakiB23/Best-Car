"use client";

import { useRef, useState } from "react";
import { IconPhotoPlus, IconTrash } from "@tabler/icons-react";

import { cn } from "@/lib/cn";
import { acceptAttribute, imageProblem } from "@/lib/images";
import { useI18n } from "@/lib/i18n-context";

export function ImagePicker({
  name,
  label = "Photo",
  error,
  currentImage,
  round,
}: {
  name: string;
  label?: string;
  error?: string;
  currentImage?: string;
  round?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [rejected, setRejected] = useState("");
  const [cleared, setCleared] = useState(false);

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    if (input.current) input.current.value = "";
    setPreview("");
    setFileName("");
    setRejected("");
    setCleared(true);
  }

  function choose(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);

    // Clearing the input would drop the file the browser just put there, so it
    // only happens when there is nothing worth submitting.
    const problem = file ? imageProblem(file) : null;
    if (!file || problem) {
      if (input.current) input.current.value = "";
      setPreview("");
      setFileName("");
      setRejected(problem ?? "");
      return;
    }

    setRejected("");
    setCleared(false);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  const stored = cleared ? "" : currentImage || "";
  const shown = preview || stored;
  const message = rejected || error;

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{t(label)}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            "grid size-20 shrink-0 place-items-center overflow-hidden border border-dashed border-line bg-canvas text-ink-400 transition hover:border-brand-300 hover:text-brand-500",
            round ? "rounded-full" : "rounded-lg",
          )}
        >
          {shown ? (
            // A blob URL is local and short-lived, so next/image adds nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <IconPhotoPlus size={22} stroke={1.6} />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-[13px] text-navy-900">
            {fileName || (stored ? t("Current photo") : t("No photo chosen"))}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            {stored
              ? t("Choose a file to replace the current photo.")
              : t("JPEG, PNG, WebP or AVIF up to 5 MB.")}
          </p>

          {shown && (
            <button
              type="button"
              onClick={clear}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-negative"
            >
              <IconTrash size={13} stroke={1.8} />
              {t("Remove")}
            </button>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        name={name}
        accept={acceptAttribute}
        className="hidden"
        onChange={(event) => choose(event.target.files?.[0])}
      />

      {cleared && <input type="hidden" name={`${name}Cleared`} value="1" />}

      {message && <span className="mt-1 block text-xs text-negative">{t(message)}</span>}
    </div>
  );
}
