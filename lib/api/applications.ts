import type {
  Application,
  ApplicationListItem,
  ApplicationListParams,
  ApplicationListResponse,
} from '@/lib/types/application';
import {
  APPLICATION_LIST_DEFAULT_LIMIT,
} from '@/lib/types/application';

/**
 * Fetches a page of the current user's applications (dashboard list fields).
 * @throws Error with message on non-OK response
 */
export async function fetchApplications(
  params: ApplicationListParams = {},
): Promise<ApplicationListResponse> {
  const searchParams = new URLSearchParams();
  const limit = params.limit ?? APPLICATION_LIST_DEFAULT_LIMIT;
  const offset = params.offset ?? 0;
  searchParams.set('limit', String(limit));
  searchParams.set('offset', String(offset));
  const q = params.q?.trim();
  if (q) searchParams.set('q', q);

  const response = await fetch(`/api/applications?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  const json = await response.json();
  return {
    data: (json.data as ApplicationListItem[] | undefined) ?? [],
    meta: json.meta ?? { limit, offset, total: 0 },
  };
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
