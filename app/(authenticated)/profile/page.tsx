"use client";

import React, { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  getProfile,
  saveProfile,
  UserProfile,
  ProfileSaveError,
} from "@/lib/profile-service";
import { applyTheme } from "@/lib/theme-utils";
import ProfileForm, { ProfileFormValues } from "@/app/components/ProfileForm";
import AvatarUpload from "@/app/components/AvatarUpload";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user } = useAuthenticator((context) => [context.user]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.userId) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        const loaded = await getProfile(user.userId);
        if (!cancelled) {
          setProfile(loaded);
          applyTheme(loaded?.themePreference ?? "light");
        }
      } catch {
        // If loading fails, leave profile as null and apply default theme
        if (!cancelled) {
          applyTheme("light");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  async function handleSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const updated = await saveProfile({
        id: user.userId,
        ...values,
        avatarUrl: profile?.avatarUrl ?? null,
      });

      setProfile(updated);
      applyTheme(values.themePreference);
      setSaveSuccess(true);

      // Persist notificationsEnabled to localStorage so the dashboard can read it
      try {
        localStorage.setItem(
          "notificationsEnabled",
          String(values.notificationsEnabled)
        );
      } catch {
        // localStorage may be unavailable in some environments; ignore silently
      }
    } catch (err) {
      if (err instanceof ProfileSaveError) {
        setSaveError(err.message);
      } else {
        setSaveError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(storageKey: string) {
    const updatedProfile: UserProfile = {
      id: user.userId,
      displayName: profile?.displayName ?? "",
      bio: profile?.bio ?? "",
      avatarUrl: storageKey,
      themePreference: profile?.themePreference ?? "light",
      notificationsEnabled: profile?.notificationsEnabled ?? false,
    };

    // Optimistically update local state
    setProfile(updatedProfile);

    try {
      const saved = await saveProfile(updatedProfile);
      setProfile(saved);
    } catch (err) {
      // Revert optimistic update on failure
      setProfile((prev) =>
        prev ? { ...prev, avatarUrl: profile?.avatarUrl ?? null } : prev
      );
      setSaveError(
        err instanceof ProfileSaveError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to save avatar"
      );
    }
  }

  const initialFormValues: ProfileFormValues = {
    displayName: profile?.displayName ?? "",
    bio: profile?.bio ?? "",
    themePreference: profile?.themePreference ?? "light",
    notificationsEnabled: profile?.notificationsEnabled ?? false,
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Profile Settings</h1>
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Profile Settings</h1>

      <div className={styles.section}>
        <AvatarUpload
          currentAvatarUrl={profile?.avatarUrl}
          userId={user.userId}
          onUploadComplete={handleAvatarUpload}
        />
      </div>

      <div className={styles.section}>
        <ProfileForm
          initialValues={initialFormValues}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />

        {saveSuccess && (
          <p className={styles.success} role="status" aria-live="polite">
            Profile saved successfully.
          </p>
        )}

        {saveError && (
          <p className={styles.error} role="alert">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
