"use client";

import { useAPATransfer } from "@/lib/hooks/useAPATransfer";

export function APATransferInitializer() {
  useAPATransfer();
  return null;
}
