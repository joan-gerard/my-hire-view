import type { Application } from '@/lib/types/application';

/**
 * Fetches the current user's applications from the API.
 * @throws Error with message on non-OK response
 */
export async function fetchApplications(): Promise<Application[]> {
  const response = await fetch('/api/applications');
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  const { data } = await response.json();
  return data ?? [];
}

/**
 * Deletes an application by id.
 * @throws Error with message on non-OK response
 */
export async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(`/api/applications?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete application');
  }
}

/**
 * Archives an application (sets is_active to false).
 * @returns The updated application from the API
 * @throws Error with message on non-OK response
 */
export async function archiveApplication(id: string): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active: false }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error((error as string) || 'Failed to archive application');
  }
  const { data } = await response.json();
  return data;
}

/**
 * Restores an archived application (sets is_active to true).
 * @returns The updated application from the API
 * @throws Error with message on non-OK response
 */
export async function restoreApplication(id: string): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active: true }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error((error as string) || 'Failed to restore application');
  }
  const { data } = await response.json();
  return data;
}
