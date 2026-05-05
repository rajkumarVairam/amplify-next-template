import React from 'react';
import styles from './HealthCard.module.css';

type HealthStatus = 'checking' | 'healthy' | 'unavailable';

interface HealthCardProps {
  label: string;
  status: HealthStatus;
  detail?: string;
}

const STATUS_TEXT: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  unavailable: 'Unavailable',
  checking: 'Checking…',
};

const STATUS_CLASS: Record<HealthStatus, string> = {
  healthy: styles.statusHealthy,
  unavailable: styles.statusUnavailable,
  checking: styles.statusChecking,
};

export default function HealthCard({ label, status, detail }: HealthCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <div className={styles.statusRow}>
        <span
          className={`${styles.indicator} ${STATUS_CLASS[status]}`}
          aria-hidden="true"
        />
        <span className={styles.statusText}>{STATUS_TEXT[status]}</span>
      </div>
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  );
}
