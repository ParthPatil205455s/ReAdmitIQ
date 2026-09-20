import { clsx } from 'clsx';

/** Merge class names with clsx */
export function cn(...inputs) {
  return clsx(inputs);
}

/** Async sleep helper */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format a probability as a percentage */
export function formatPercent(value, decimals = 0) {
  if (value == null) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentage(value, decimals = 0) {
  return formatPercent(value, decimals);
}

/** Format date string to locale */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Format relative time (e.g. 5m ago, 2h ago, yesterday) */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

/** Return badge variant based on risk level */
export function getRiskBadgeVariant(level) {
  const norm = (level || 'low').toLowerCase();
  if (norm === 'critical' || norm === 'high') return 'danger';
  if (norm === 'medium') return 'warning';
  return 'success';
}

/** Map numeric risk score to categorical level */
export function getRiskLevel(score) {
  const s = Number(score) || 0;
  if (s >= 0.75) return 'critical';
  if (s >= 0.5) return 'high';
  if (s >= 0.25) return 'medium';
  return 'low';
}

/** Map risk level or score to human label */
export function getRiskLabel(levelOrScore) {
  const lvl =
    typeof levelOrScore === 'number'
      ? getRiskLevel(levelOrScore)
      : (levelOrScore || 'low').toLowerCase();
  const map = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };
  return map[lvl] || 'Low Risk';
}

/** Extract user initials from name */
export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Capitalize first letter */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
