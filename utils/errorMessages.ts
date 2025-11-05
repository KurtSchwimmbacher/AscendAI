export function formatErrorMessage(error: unknown, context?: string): string {
  // Axios/network-like errors
  const message = (error instanceof Error ? error.message : '') || '';
  const lower = message.toLowerCase();

  // Firebase auth recent login
  if (lower.includes('auth/requires-recent-login')) {
    return 'For security, please reauthenticate and try again.';
  }

  // Permission/unauthenticated
  if (lower.includes('permission') || lower.includes('permission-denied')) {
    return 'You do not have permission to perform this action.';
  }
  if (lower.includes('unauthenticated')) {
    return 'Please sign in to continue.';
  }

  // Network/timeouts
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }

  // Storage/file not found
  if (lower.includes('object-not-found') || lower.includes('not found')) {
    return 'The requested item could not be found.';
  }

  // Firestore unavailable
  if (lower.includes('unavailable')) {
    return 'Service is temporarily unavailable. Please try again later.';
  }

  // Generic API/validation
  if (lower.includes('invalid') || lower.includes('bad request')) {
    return 'Something seems off with the request. Please try again.';
  }

  // Fallback with optional context to give users meaning
  if (context) {
    return `${context} failed. Please try again.`;
  }
  return 'Something went wrong. Please try again.';
}
