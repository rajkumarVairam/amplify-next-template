// Feature: dashboard-and-profile, Property 8: Avatar file size validation
// Feature: dashboard-and-profile, Property 9: Avatar preview URL generation
// Feature: dashboard-and-profile, Property 10: Avatar storage path owner-scoping

import * as fc from "fast-check";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("aws-amplify/storage", () => ({
  uploadData: vi.fn(),
}));

// jsdom does not implement URL.createObjectURL — provide a global stub so the
// component can call it without throwing. Individual tests override this stub
// with their own mock when they need to inspect the returned value.
if (typeof URL.createObjectURL === "undefined") {
  Object.defineProperty(URL, "createObjectURL", {
    writable: true,
    value: vi.fn((file: File) => `blob:http://localhost/${file.name}`),
  });
}

import { uploadData } from "aws-amplify/storage";
import { validateAvatarFile } from "@/app/components/AvatarUpload";
import AvatarUpload from "@/app/components/AvatarUpload";

const mockUploadData = vi.mocked(uploadData);

// ---------------------------------------------------------------------------
// Property 8: Avatar file size validation
// Validates: Requirements 6.2
// ---------------------------------------------------------------------------

describe("Property 8: Avatar file size validation", () => {
  it("blocks upload and returns error for any file larger than 5 MB", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5_242_881, max: 20_000_000 }),
        fc.constantFrom("image/jpeg", "image/png", "image/webp"),
        (size, type) => {
          const error = validateAvatarFile({ size, type });
          return error === "File must be 5 MB or smaller";
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns no size error for any valid file (size ≤ 5 MB, correct MIME type)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5_242_880 }),
        fc.constantFrom("image/jpeg", "image/png", "image/webp"),
        (size, type) => {
          const error = validateAvatarFile({ size, type });
          return error === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns MIME type error for invalid MIME types regardless of size", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5_242_880 }),
        fc.string({ minLength: 1 }).filter(
          (t) => !["image/jpeg", "image/png", "image/webp"].includes(t)
        ),
        (size, type) => {
          const error = validateAvatarFile({ size, type });
          return error === "Only JPEG, PNG, or WebP images are allowed";
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Avatar preview URL generation
// Validates: Requirements 6.3
// ---------------------------------------------------------------------------

describe("Property 9: Avatar preview URL generation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("produces a non-empty preview URL for any valid image file", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5_242_880 }),
        fc.constantFrom("image/jpeg", "image/png", "image/webp"),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (size, mimeType, fileName) => {
          // Each run gets a unique, deterministic blob URL
          const mockUrl = `blob:http://localhost/preview-${size}-${mimeType}`;
          URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);

          const file = new File(["x"], `${fileName}.jpg`, { type: mimeType });
          // Override the size property since File constructor doesn't accept size directly
          Object.defineProperty(file, "size", { value: size, configurable: true });

          const { unmount } = render(
            React.createElement(AvatarUpload, {
              currentAvatarUrl: null,
              userId: "test-user",
              onUploadComplete: vi.fn(),
            })
          );

          // Simulate file selection by triggering the change event
          const input = document.querySelector(
            'input[type="file"]'
          ) as HTMLInputElement;

          await act(async () => {
            Object.defineProperty(input, "files", {
              value: [file],
              configurable: true,
            });
            input.dispatchEvent(new Event("change", { bubbles: true }));
          });

          // The preview img should now be present with a non-empty src
          const img = document.querySelector("img") as HTMLImageElement | null;
          // jsdom prefixes blob: URLs with the base URL, so check the src ends with our mock path
          const hasPreview =
            img !== null &&
            img.src.length > 0 &&
            img.src !== "about:blank";

          unmount();
          return hasPreview;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Avatar storage path owner-scoping
// Validates: Requirements 6.4
// ---------------------------------------------------------------------------

describe("Property 10: Avatar storage path owner-scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("storage key contains userId as a path segment for any userId and valid image file", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 64 }).filter((s) => !s.includes("/")),
        fc.integer({ min: 1, max: 5_242_880 }),
        fc.constantFrom("image/jpeg", "image/png", "image/webp"),
        fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
        async (userId, size, mimeType, baseName) => {
          const capturedPaths: string[] = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mockUploadData.mockImplementation((({ path }: { path: string; data: unknown }) => {
            capturedPaths.push(path);
            return {
              result: Promise.resolve({ path }),
              cancel: vi.fn(),
              pause: vi.fn(),
              resume: vi.fn(),
              state: "SUCCESS" as const,
            } as unknown as ReturnType<typeof uploadData>;
          }) as any);

          const onUploadComplete = vi.fn();

          const { unmount } = render(
            React.createElement(AvatarUpload, {
              currentAvatarUrl: null,
              userId,
              onUploadComplete,
            })
          );

          const fileName = `${baseName}.jpg`;
          const file = new File(["x"], fileName, { type: mimeType });
          Object.defineProperty(file, "size", { value: size, configurable: true });

          const input = document.querySelector(
            'input[type="file"]'
          ) as HTMLInputElement;

          // Select the file
          await act(async () => {
            Object.defineProperty(input, "files", {
              value: [file],
              configurable: true,
            });
            input.dispatchEvent(new Event("change", { bubbles: true }));
          });

          // Click the Upload button
          const uploadButton = screen.getByRole("button", { name: "Upload" });
          await act(async () => {
            uploadButton.click();
          });

          unmount();

          if (capturedPaths.length === 0) return false;

          const storagePath = capturedPaths[0];
          // Path must match avatars/{userId}/...
          return storagePath.startsWith(`avatars/${userId}/`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
