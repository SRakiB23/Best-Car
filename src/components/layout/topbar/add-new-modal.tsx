"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { ProductModal } from "@/components/products/product-modal";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n-context";

export function AddNewModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip label="Add a new product">
        <Button variant="brand" onClick={() => setOpen(true)} className="hidden sm:inline-flex">
          <IconPlus size={16} stroke={2.4} />
          {t("Add New")}
        </Button>
      </Tooltip>

      <ProductModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
