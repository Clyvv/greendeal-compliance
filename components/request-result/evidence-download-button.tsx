"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

/**
 * Stage 7.12 — mocked evidence download for the public Request Result
 * page: no real file storage/retrieval exists in this prototype (same
 * convention as evidence *upload* elsewhere in the app — a filename is
 * captured, nothing is actually stored), so "downloading" just confirms
 * via toast rather than attempting a real file transfer.
 */
export function EvidenceDownloadButton({ documentName }: { documentName: string }) {
  const { toast } = useToast();

  function handleDownload() {
    toast({
      title: "Download started (simulated)",
      description: `${documentName} — this prototype has no real file storage, so nothing is actually downloaded.`,
      variant: "success",
    });
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleDownload}>
      Download
    </Button>
  );
}
