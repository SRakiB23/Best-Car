"use client";

import { useRef, useState } from "react";
import { IconCamera, IconTrash } from "@tabler/icons-react";

import { initialsFrom } from "@/lib/account";
import { acceptAttribute, imageProblem } from "@/lib/images";
import { useI18n } from "@/lib/i18n-context";

/**
 * The avatar and its controls in one place. `ImagePicker` shows a thumbnail
 * beside a filename, which reads as a second, competing portrait when the page
 * already displays the person; here the portrait itself is the control.
 */
export function AvatarPicker({
  name,
  currentImage,
  error,
  inputName = "avatar",
}: {
  name: string;
  currentImage?: string;
  error?: string;
  inputName?: string;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [rejected, setRejected] = useState("");
  const [cleared, setCleared] = useState(false);

  function choose(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);

    const problem = file ? imageProblem(file) : null;
    if (!file || problem) {
      if (input.current) input.current.value = "";
      setPreview("");
      setRejected(problem ?? "");
      return;
    }

    setRejected("");
    setCleared(false);
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    if (input.current) input.current.value = "";
    setPreview("");
    setRejected("");
    setCleared(true);
  }

  const shown = preview || (cleared ? "" : currentImage || "");
  const message = rejected || error;

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="relative">
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-label={t("Change photo")}
          className="group grid size-20 place-items-center overflow-hidden rounded-full bg-brand-100 text-xl font-semibold text-brand-700 ring-4 ring-brand-50 transition hover:ring-brand-100"
        >
          {shown ? (
            // A blob URL is local and short-lived, so next/image adds nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            initialsFrom(name)
          )}

          <span className="absolute inset-0 grid place-items-center rounded-full bg-navy-900/45 text-white opacity-0 transition group-hover:opacity-100">
            <IconCamera size={20} stroke={1.8} />
          </span>
        </button>

        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 grid size-7 place-items-center rounded-full border-2 border-white bg-brand-500 text-white shadow-sm"
        >
          <IconCamera size={14} stroke={1.9} />
        </span>
      </div>

      {shown ? (
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs font-medium text-negative"
        >
          <IconTrash size={13} stroke={1.8} />
          {t("Remove photo")}
        </button>
      ) : (
        <span className="text-xs text-ink-400">{t("Initials shown")}</span>
      )}

      <input
        ref={input}
        type="file"
        name={inputName}
        accept={acceptAttribute}
        className="hidden"
        onChange={(event) => choose(event.target.files?.[0])}
      />

      {cleared && <input type="hidden" name={`${inputName}Cleared`} value="1" />}

      {message && <span className="text-xs text-negative">{t(message)}</span>}
    </div>
  );
}
