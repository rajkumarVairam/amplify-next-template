"use client";

import React, { useRef, useState } from "react";
import { uploadData } from "aws-amplify/storage";
import styles from "./AvatarUpload.module.css";

interface AvatarUploadProps {
  currentAvatarUrl: string | null | undefined;
  userId: string;
  onUploadComplete: (storageKey: string) => void;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE = 5_242_880; // 5 MB

export function validateAvatarFile(file: {
  size: number;
  type: string;
}): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File must be 5 MB or smaller";
  }
  if (
    !ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    return "Only JPEG, PNG, or WebP images are allowed";
  }
  return null;
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  onUploadComplete,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const displayUrl = previewUrl ?? currentAvatarUrl ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setError(validationError);
      // Reset the input so the same file can be re-selected after fixing
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const path = `avatars/${userId}/${selectedFile.name}`;
      const result = await uploadData({ path, data: selectedFile }).result;
      const storageKey = result.path;
      onUploadComplete(storageKey);
      setSelectedFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={styles.container}>
      {displayUrl && (
        <img
          src={displayUrl}
          alt="Avatar preview"
          className={styles.preview}
        />
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.selectButton}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {displayUrl ? "Change Avatar" : "Select Avatar"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-label="Select avatar image"
        />

        {selectedFile && !isUploading && (
          <button
            type="button"
            className={styles.uploadButton}
            onClick={handleUpload}
          >
            Upload
          </button>
        )}

        {isUploading && (
          <span className={styles.loadingText} aria-live="polite">
            Uploading…
          </span>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
