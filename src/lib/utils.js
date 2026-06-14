import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const statusConfig = {
  pending: { label: 'Pending Review', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  in_review: { label: 'In Review', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  proposal_sent: { label: 'Proposal Sent', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  in_progress: { label: 'Assessment In Progress', color: 'text-accent-400 bg-accent-400/10 border-accent-400/20' },
  completed: { label: 'Completed', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Closed', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
};
