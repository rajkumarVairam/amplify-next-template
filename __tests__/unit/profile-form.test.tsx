// Feature: dashboard-and-profile, Property 5: Profile form pre-population
// Feature: dashboard-and-profile, Property 6: Profile form validation — invalid inputs rejected
// Feature: dashboard-and-profile, Property 7: Profile form submission — valid inputs accepted

import * as fc from "fast-check";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect } from "vitest";
import ProfileForm, { type ProfileFormValues } from "@/app/components/ProfileForm";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const themeArb = fc.constantFrom<"light" | "dark">("light", "dark");

const profileFormValuesArb = fc.record<ProfileFormValues>({
  displayName: fc.string({ minLength: 0, maxLength: 64 }),
  bio: fc.string({ minLength: 0, maxLength: 280 }),
  themePreference: themeArb,
  notificationsEnabled: fc.boolean(),
});

// ---------------------------------------------------------------------------
// Property 5: Profile form pre-population
// Validates: Requirements 5.6, 8.5
// ---------------------------------------------------------------------------

describe("Property 5: Profile form pre-population", () => {
  it("renders every form field with the corresponding value from initialValues", () => {
    fc.assert(
      fc.property(profileFormValuesArb, (initialValues) => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const { unmount } = render(
          React.createElement(ProfileForm, {
            initialValues,
            onSubmit,
            isSaving: false,
          })
        );

        // displayName input
        const displayNameInput = screen.getByLabelText(
          /display name/i
        ) as HTMLInputElement;
        expect(displayNameInput.value).toBe(initialValues.displayName);

        // bio textarea
        const bioTextarea = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;
        expect(bioTextarea.value).toBe(initialValues.bio);

        // themePreference select
        const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;
        expect(themeSelect.value).toBe(initialValues.themePreference);

        // notificationsEnabled checkbox
        const notifCheckbox = screen.getByLabelText(
          /enable notifications/i
        ) as HTMLInputElement;
        expect(notifCheckbox.checked).toBe(initialValues.notificationsEnabled);

        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Profile form validation — invalid inputs rejected
// Validates: Requirements 5.3, 5.4, 5.5
// ---------------------------------------------------------------------------

describe("Property 6: Profile form validation — invalid inputs rejected", () => {
  it("shows error and does NOT call onSubmit for empty/whitespace-only displayName", async () => {
    await fc.assert(
      fc.asyncProperty(
        // empty string or whitespace-only string up to 64 chars
        fc.oneof(
          fc.constant(""),
          fc
            .string({ minLength: 1, maxLength: 64 })
            .map((s) => s.replace(/[^\s]/g, " "))
            .filter((s) => s.trim().length === 0 && s.length > 0)
        ),
        fc.string({ minLength: 0, maxLength: 280 }),
        themeArb,
        fc.boolean(),
        async (displayName, bio, themePreference, notificationsEnabled) => {
          const onSubmit = vi.fn().mockResolvedValue(undefined);
          const { unmount } = render(
            React.createElement(ProfileForm, {
              initialValues: {
                displayName,
                bio,
                themePreference,
                notificationsEnabled,
              },
              onSubmit,
              isSaving: false,
            })
          );

          const form = document.querySelector("form") as HTMLFormElement;
          await act(async () => {
            fireEvent.submit(form);
          });

          const hasError =
            screen.queryByText("Display name is required") !== null;
          const notCalled = onSubmit.mock.calls.length === 0;

          unmount();
          return hasError && notCalled;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("shows error and does NOT call onSubmit for displayName longer than 64 chars", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 65, maxLength: 200 }),
        fc.string({ minLength: 0, maxLength: 280 }),
        themeArb,
        fc.boolean(),
        async (displayName, bio, themePreference, notificationsEnabled) => {
          const onSubmit = vi.fn().mockResolvedValue(undefined);
          const { unmount } = render(
            React.createElement(ProfileForm, {
              initialValues: {
                displayName,
                bio,
                themePreference,
                notificationsEnabled,
              },
              onSubmit,
              isSaving: false,
            })
          );

          const form = document.querySelector("form") as HTMLFormElement;
          await act(async () => {
            fireEvent.submit(form);
          });

          const hasError =
            screen.queryByText(
              "Display name must be 64 characters or fewer"
            ) !== null;
          const notCalled = onSubmit.mock.calls.length === 0;

          unmount();
          return hasError && notCalled;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("shows error and does NOT call onSubmit for bio longer than 280 chars", async () => {
    await fc.assert(
      fc.asyncProperty(
        // valid displayName (non-empty, non-whitespace, ≤64 chars)
        fc
          .string({ minLength: 1, maxLength: 64 })
          .filter((s) => s.trim().length > 0),
        fc.string({ minLength: 281, maxLength: 500 }),
        themeArb,
        fc.boolean(),
        async (displayName, bio, themePreference, notificationsEnabled) => {
          const onSubmit = vi.fn().mockResolvedValue(undefined);
          const { unmount } = render(
            React.createElement(ProfileForm, {
              initialValues: {
                displayName,
                bio,
                themePreference,
                notificationsEnabled,
              },
              onSubmit,
              isSaving: false,
            })
          );

          const form = document.querySelector("form") as HTMLFormElement;
          await act(async () => {
            fireEvent.submit(form);
          });

          const hasError =
            screen.queryByText("Bio must be 280 characters or fewer") !== null;
          const notCalled = onSubmit.mock.calls.length === 0;

          unmount();
          return hasError && notCalled;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Profile form submission — valid inputs accepted
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe("Property 7: Profile form submission — valid inputs accepted", () => {
  it("calls onSubmit with exactly the entered values for any valid displayName and bio", async () => {
    await fc.assert(
      fc.asyncProperty(
        // valid displayName: 1–64 chars, non-whitespace-only
        fc
          .string({ minLength: 1, maxLength: 64 })
          .filter((s) => s.trim().length > 0),
        // valid bio: 0–280 chars
        fc.string({ minLength: 0, maxLength: 280 }),
        themeArb,
        fc.boolean(),
        async (displayName, bio, themePreference, notificationsEnabled) => {
          const onSubmit = vi.fn().mockResolvedValue(undefined);
          const { unmount } = render(
            React.createElement(ProfileForm, {
              initialValues: {
                displayName,
                bio,
                themePreference,
                notificationsEnabled,
              },
              onSubmit,
              isSaving: false,
            })
          );

          const form = document.querySelector("form") as HTMLFormElement;
          await act(async () => {
            fireEvent.submit(form);
          });

          const wasCalled = onSubmit.mock.calls.length === 1;
          if (!wasCalled) {
            unmount();
            return false;
          }

          const submittedValues = onSubmit.mock.calls[0][0] as ProfileFormValues;
          const correct =
            submittedValues.displayName === displayName &&
            submittedValues.bio === bio &&
            submittedValues.themePreference === themePreference &&
            submittedValues.notificationsEnabled === notificationsEnabled;

          unmount();
          return correct;
        }
      ),
      { numRuns: 100 }
    );
  });
});
