'use client';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  message: string;
  subtitle?: string;
  show: boolean;
}

export default function ProgressBar({ progress, message, subtitle, show }: ProgressBarProps) {
  if (!show) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>✨</div>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <span className={styles.message}>{message}</span>
            <span className={styles.percentage}>{progress}%</span>
          </div>
          <div className={styles.barContainer}>
            <div className={styles.barBackground}>
              <div
                className={styles.barFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {subtitle && (
            <div className={styles.subtitleRow}>
              <span className={styles.subtitle}>{subtitle}</span>
              <span className={styles.badge}>EN COURS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
