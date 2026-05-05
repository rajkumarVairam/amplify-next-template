import { HealthCheckResult } from "@/lib/health-service";

/**
 * Pure helper: given the previous and next result sets, fire window.alert()
 * for any service that transitioned from 'healthy' to 'unavailable'.
 * Only fires when notificationsEnabled is true.
 */
export function checkAndNotify(
  prev: HealthCheckResult[],
  next: HealthCheckResult[],
  notificationsEnabled: boolean
): void {
  if (!notificationsEnabled) return;

  for (const nextResult of next) {
    const prevResult = prev.find((r) => r.name === nextResult.name);
    if (
      prevResult?.status === "healthy" &&
      nextResult.status === "unavailable"
    ) {
      window.alert(`Service "${nextResult.name}" is now unavailable.`);
    }
  }
}
