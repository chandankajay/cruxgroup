"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { ExternalLink, FileText, ImageIcon, Upload } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { viewerUrlForStoredKycBlob } from "../../lib/kyc-blob-view-url";
import { MAX_KYC_FILE_BYTES, KYC_ACCEPT_MIME } from "./schema";

/** Widen RHF field props from generic `FormField` render to a file `File` value. */
type FileFieldRenderProps = ControllerRenderProps<FieldValues, FieldPath<FieldValues>>;

function fileLabelFromBlobUrl(url: string): string {
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "document";
    return decodeURIComponent(last) || "Uploaded document";
  } catch {
    return "Uploaded document";
  }
}

interface KycFileDropzoneInnerProps {
  readonly field: FileFieldRenderProps;
  readonly disabled?: boolean;
  readonly inputId: string;
  /** When set and no new `File` is chosen, show a link to the stored Vercel Blob. */
  readonly existingFileUrl?: string | null;
}

function KycFileDropzoneInner({ field, disabled, inputId, existingFileUrl }: KycFileDropzoneInnerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const raw: unknown = field.value;
  const file = raw instanceof File ? raw : undefined;
  const hasExistingOnServer = Boolean(existingFileUrl) && !file;

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFiles = useCallback(
    (list: FileList | null) => {
      const next = list?.[0];
      if (next) field.onChange(next);
    },
    [field]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled) return;
      pickFiles(e.dataTransfer.files);
    },
    [disabled, pickFiles]
  );

  const readOnlyWithExisting = Boolean(disabled && hasExistingOnServer);
  const showDefaultDrop = !file && !hasExistingOnServer;
  const showReplaceTarget = hasExistingOnServer && !file && !disabled;
  const openDocumentHref = existingFileUrl
    ? viewerUrlForStoredKycBlob(existingFileUrl)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
        readOnlyWithExisting ? "min-h-0 py-4" : "min-h-[140px]",
        dragActive && !disabled
          ? "border-brand-orange bg-orange-50/50"
          : "border-muted-foreground/40",
        hasExistingOnServer ? "bg-muted/20" : undefined,
        disabled
          ? cn(
              "cursor-not-allowed",
              readOnlyWithExisting ? "opacity-100" : "opacity-60"
            )
          : "cursor-pointer hover:border-brand-orange/60"
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role={readOnlyWithExisting ? "group" : "button"}
      tabIndex={disabled ? -1 : 0}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={KYC_ACCEPT_MIME.join(",")}
        disabled={disabled}
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {hasExistingOnServer && existingFileUrl ? (
        <div
          className="mb-3 w-full max-w-full rounded-md border border-border bg-white/80 px-3 py-2.5 text-left text-sm text-charcoal dark:bg-background/50"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-charcoal" aria-hidden />
              <div className="min-w-0">
                <p className="font-medium leading-tight">Document on file</p>
                <p
                  className="mt-0.5 truncate text-xs text-muted-foreground"
                  title={fileLabelFromBlobUrl(existingFileUrl)}
                >
                  {fileLabelFromBlobUrl(existingFileUrl)}
                </p>
              </div>
            </div>
            {openDocumentHref ? (
            <a
              href={openDocumentHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-orange underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            ) : null}
          </div>
        </div>
      ) : null}
      {file ? (
        <div className="mt-0 flex w-full max-w-full flex-col items-center gap-2">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="max-h-28 max-w-full rounded-md border object-contain"
            />
          ) : file.type === "application/pdf" ? (
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <FileText className="h-6 w-6 shrink-0 text-red-600" aria-hidden />
              <span className="truncate">{file.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <ImageIcon className="h-6 w-6 shrink-0" aria-hidden />
              <span className="truncate">{file.name}</span>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(ev) => {
              ev.stopPropagation();
              field.onChange(undefined);
            }}
          >
            Remove
          </Button>
        </div>
      ) : null}
      {showDefaultDrop || showReplaceTarget ? (
        <div className={cn("flex flex-col items-center", hasExistingOnServer && !file ? "mt-1" : "mt-0")}>
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-center text-sm text-muted-foreground">
            {showDefaultDrop
              ? "Drag and drop or click to upload"
              : "Drag, drop, or click to replace this file"}
          </p>
        </div>
      ) : null}
    </div>
  );
}

interface KycFileDropzoneProps<T extends FieldValues> {
  readonly control: Control<T>;
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly disabled?: boolean;
  /** Stored Blob URL to show when no new file is selected (e.g. after a previous submit). */
  readonly existingFileUrl?: string | null;
}

export function KycFileDropzone<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  existingFileUrl,
}: KycFileDropzoneProps<T>) {
  const reactId = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <KycFileDropzoneInner
              field={field as FileFieldRenderProps}
              disabled={disabled}
              inputId={`${reactId}-${String(name)}`}
              existingFileUrl={existingFileUrl}
            />
          </FormControl>
          <FormDescription>
            Max {(MAX_KYC_FILE_BYTES / (1024 * 1024)).toFixed(0)}MB. JPEG, PNG, WebP, or PDF.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
