const DEFAULT_COMPANY_NAME = 'Ma Société';

export function getDisplayName(email: string | null | undefined, companyName: string): string {
  if (companyName && companyName !== DEFAULT_COMPANY_NAME) {
    return companyName;
  }
  if (email) {
    const localPart = email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return '';
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  const initials = words.map((w) => w.charAt(0).toUpperCase()).join('');
  return initials.slice(0, 2) || '?';
}
