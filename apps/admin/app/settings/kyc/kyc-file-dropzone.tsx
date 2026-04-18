"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { FileText, ImageIcon, Upload } from "lucide-react";
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
import { MAX_KYC_FILE_BYTES, KYC_ACCEPT_MIME } from "./schema";

/** Widen RHF field props from generic `FormField` render to a file `File` value. */
type FileFieldRenderProps = ControllerRenderProps<FieldValues, FieldPath<FieldValues>>;

interface KycFileDropzoneInnerProps {
  readonly field: FileFieldRenderProps;
  readonly disabled?: boolean;
  readonly inputId: string;
}

function KycFileDropzoneInner({ field, disabled, inputId }: KycFileDropzoneInnerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const raw: unknown = field.value;
  const file = raw instanceof File ? raw : undefined;

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

  return (
    <div
      className={cn(
        "flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
        dragActive ? "border-brand-orange bg-orange-50/50" : "border-muted-foreground/40",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-brand-orange/60"
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
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
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
      <Upload className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-center text-sm text-muted-foreground">
        Drag and drop or click to upload
      </p>
      {file ? (
        <div className="mt-4 flex w-full max-w-full flex-col items-center gap-2">
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
    </div>
  );
}

interface KycFileDropzoneProps<T extends FieldValues> {
  readonly control: Control<T>;
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly disabled?: boolean;
}

export function KycFileDropzone<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
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
