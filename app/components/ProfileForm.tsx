"use client";

import React, { useState } from "react";
import styles from "./ProfileForm.module.css";

export interface ProfileFormValues {
  displayName: string; // max 64 chars
  bio: string; // max 280 chars
  themePreference: "light" | "dark";
  notificationsEnabled: boolean;
}

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

interface FormErrors {
  displayName?: string;
  bio?: string;
}

function validate(values: ProfileFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.displayName || values.displayName.trim().length === 0) {
    errors.displayName = "Display name is required";
  } else if (values.displayName.length > 64) {
    errors.displayName = "Display name must be 64 characters or fewer";
  }

  if (values.bio.length > 280) {
    errors.bio = "Bio must be 280 characters or fewer";
  }

  return errors;
}

export default function ProfileForm({
  initialValues,
  onSubmit,
  isSaving,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, displayName: e.target.value }));
  }

  function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValues((prev) => ({ ...prev, bio: e.target.value }));
  }

  function handleThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValues((prev) => ({
      ...prev,
      themePreference: e.target.value as "light" | "dark",
    }));
  }

  function handleNotificationsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({
      ...prev,
      notificationsEnabled: e.target.checked,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Display Name */}
      <div className={styles.field}>
        <label htmlFor="displayName" className={styles.label}>
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          className={styles.input}
          value={values.displayName}
          onChange={handleDisplayNameChange}
          maxLength={64}
          aria-describedby={
            errors.displayName ? "displayName-error" : "displayName-count"
          }
        />
        {errors.displayName ? (
          <span id="displayName-error" className={styles.error} role="alert">
            {errors.displayName}
          </span>
        ) : null}
        <span id="displayName-count" className={styles.charCount}>
          {values.displayName.length} / 64
        </span>
      </div>

      {/* Bio */}
      <div className={styles.field}>
        <label htmlFor="bio" className={styles.label}>
          Bio
        </label>
        <textarea
          id="bio"
          className={styles.textarea}
          value={values.bio}
          onChange={handleBioChange}
          maxLength={280}
          rows={4}
          aria-describedby={errors.bio ? "bio-error" : "bio-count"}
        />
        {errors.bio ? (
          <span id="bio-error" className={styles.error} role="alert">
            {errors.bio}
          </span>
        ) : null}
        <span id="bio-count" className={styles.charCount}>
          {values.bio.length} / 280
        </span>
      </div>

      {/* Theme Preference */}
      <div className={styles.field}>
        <label htmlFor="themePreference" className={styles.label}>
          Theme
        </label>
        <select
          id="themePreference"
          className={styles.input}
          value={values.themePreference}
          onChange={handleThemeChange}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Notifications */}
      <div className={styles.field}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={values.notificationsEnabled}
            onChange={handleNotificationsChange}
            aria-label="Enable notifications"
          />
          {" "}Enable Notifications
        </label>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSaving}
      >
        {isSaving ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
