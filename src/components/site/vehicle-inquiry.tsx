"use client";

import { useState } from "react";
import { IconMessage2Question } from "@tabler/icons-react";

import { InquiryForm } from "@/components/site/inquiry-form";
import { Modal } from "@/components/ui/modal";

/**
 * Floating entry point for visitors who are interested in this car but not ready
 * to pick dates and pay.
 *
 * Stacked directly above the AI advisor, which is fixed to the same corner by
 * the /cars layout. The offsets below clear that pill's height at each
 * breakpoint, and this button stays icon-only until there is room for a label,
 * so two stacked pills never crowd a phone screen.
 */
export function VehicleInquiry({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sits one pill above the AI advisor; both are lifted by the same amount
          so the Netlify badge clears them without changing their spacing. */}
      <div className="fixed bottom-32 right-5 z-50 sm:bottom-37 sm:right-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Ask a question about the ${vehicleName}`}
          className="flex items-center gap-2 rounded-full bg-night-900 p-3 text-white shadow-float transition hover:scale-105 hover:bg-night-800 active:scale-95 motion-reduce:hover:scale-100 sm:py-2.5 sm:pl-4 sm:pr-5"
        >
          <IconMessage2Question size={24} stroke={1.7} className="shrink-0 text-gold-300" />

          <span className="hidden text-sm font-semibold sm:block">Ask about this car</span>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Ask about the ${vehicleName}`}
        description="Tell us what you need and our rental team will reply by email, usually within a few hours."
        className="max-w-xl"
      >
        <div className="max-h-[70dvh] overflow-y-auto px-5 py-5">
          <InquiryForm vehicleId={vehicleId} bare />
        </div>
      </Modal>
    </>
  );
}
