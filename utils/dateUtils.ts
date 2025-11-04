/**
 * Utility function to format Firestore timestamps and date values
 */
export function formatDate(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  
  try {
    let date: Date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === 'number') {
      // Unix timestamp in seconds or milliseconds
      date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

