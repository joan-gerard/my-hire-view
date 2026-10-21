import type {
  Application,
  ApplicationListItem,
  ApplicationListParams,
  ApplicationListResponse,
  ApplicationDashboardCounts,
} from '@/lib/types/application';
import {
  APPLICATION_LIST_DEFAULT_LIMIT,
} from '@/lib/types/application';
import { notifyOnboardingChecklistChanged } from '@/lib/utils/onboarding-checklist-sync';

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
  if (params.status) searchParams.set('status', params.status);

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

async function fetchApplicationTotal(
  status?: ApplicationListParams['status'],
): Promise<number> {
  const { meta } = await fetchApplications({
    limit: 1,
    offset: 0,
    status,
  });
  return meta.total;
}

/**
 * Global status tallies for the dashboard summary rail (not scoped to search).
 * @throws Error when any count request fails
 */
export async function fetchApplicationStatusCounts(): Promise<ApplicationDashboardCounts> {
  const [all, active, draft, archived] = await Promise.all([
    fetchApplicationTotal(),
    fetchApplicationTotal('active'),
    fetchApplicationTotal('draft'),
    fetchApplicationTotal('archived'),
  ]);
  return { all, active, draft, archived };
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
  notifyOnboardingChecklistChanged();
}

/**
 * Archives an application (`status = archived`, sets `archived_at`).
 * @returns The updated application from the API
 * @throws Error with message on non-OK response
 */
export async function archiveApplication(id: string): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'archived' }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error((error as string) || 'Failed to archive application');
  }
  const { data } = await response.json();
  notifyOnboardingChecklistChanged();
  return data;
}

/**
 * Restores an archived application (`status = active`, clears `archived_at`).
 * @returns The updated application from the API
 * @throws Error with message on non-OK response
 */
export async function restoreApplication(id: string): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'active' }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error((error as string) || 'Failed to restore application');
  }
  const { data } = await response.json();
  notifyOnboardingChecklistChanged();
  return data;
}

/**
 * Publishes a draft application (`status = active`, clears `archived_at`).
 * Same PUT as restore; named for the draft → live UX (F16-050).
 * @returns The updated application from the API
 * @throws Error with message on non-OK response
 */
export async function publishApplication(id: string): Promise<Application> {
  const response = await fetch('/api/applications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'active' }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error((error as string) || 'Failed to publish application');
  }
  const { data } = await response.json();
  notifyOnboardingChecklistChanged();
  return data;
}
