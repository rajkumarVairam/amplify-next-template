"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { runHealthChecks, HealthCheckResult } from "@/lib/health-service";
import { checkAndNotify } from "@/lib/notification-utils";
import HealthCard from "@/app/components/HealthCard";
import styles from "./dashboard.module.css";

/** The three services the dashboard always shows, in order. */
const SERVICE_NAMES = ["Auth Session", "Amplify API", "Data Layer"];

export default function DashboardPage() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep a ref to the previous results so we can detect transitions.
  const prevResultsRef = useRef<HealthCheckResult[]>([]);

  const refresh = async () => {
    setIsRefreshing(true);
    const newResults = await runHealthChecks();
    const notificationsEnabled =
      localStorage.getItem("notificationsEnabled") === "true";
    checkAndNotify(prevResultsRef.current, newResults, notificationsEnabled);
    prevResultsRef.current = newResults;
    setResults(newResults);
    setLastRefreshed(new Date().toISOString());
    setIsRefreshing(false);
  };

  // Run health checks on mount.
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const email =
    (user?.signInDetails as { loginId?: string } | undefined)?.loginId ?? "";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Hello, {email}</h1>
          {lastRefreshed && (
            <p className={styles.timestamp}>
              Last refreshed: {lastRefreshed}
            </p>
          )}
        </div>
        <button
          className={styles.refreshBtn}
          onClick={refresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className={styles.grid}>
        {results.length === 0
          ? // While loading, show placeholder cards in 'checking' status.
            SERVICE_NAMES.map((name) => (
              <HealthCard key={name} label={name} status="checking" />
            ))
          : results.map((result) => (
              <HealthCard
                key={result.name}
                label={result.name}
                status={result.status}
                detail={result.detail}
              />
            ))}
      </div>
    </div>
  );
}
