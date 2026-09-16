import { describe, expect, it } from 'vitest';
import {
  APPLICATION_STATUS_LEGEND_ITEMS,
  CV_MISSING_LEGEND,
  DRAFT_ACTION_LEGEND_ITEMS,
  getApplicationStatusDisplay,
  getApplicationStatusDisplayByKey,
  resolveApplicationStatusVisual,
} from '@/lib/utils/application-status-display';

describe('resolveApplicationStatusVisual', () => {
  it('maps archived and draft regardless of view count', () => {
    expect(resolveApplicationStatusVisual('archived', 0)).toBe('archived');
    expect(resolveApplicationStatusVisual('archived', 5)).toBe('archived');
    expect(resolveApplicationStatusVisual('draft', 0)).toBe('draft');
    expect(resolveApplicationStatusVisual('draft', 3)).toBe('draft');
  });

  it('maps active by view count', () => {
    expect(resolveApplicationStatusVisual('active', 0)).toBe('active_unviewed');
    expect(resolveApplicationStatusVisual('active', 1)).toBe('active_viewed');
  });
});

describe('getApplicationStatusDisplay', () => {
  it('returns label and description for each visual', () => {
    expect(getApplicationStatusDisplay('draft', 0)).toMatchObject({
      key: 'draft',
      label: 'Draft',
    });
    expect(getApplicationStatusDisplay('active', 0).key).toBe('active_unviewed');
    expect(getApplicationStatusDisplay('active', 2).key).toBe('active_viewed');
    expect(getApplicationStatusDisplay('archived', 0).key).toBe('archived');
  });

  it('keeps legend items aligned with display-by-key', () => {
    for (const item of APPLICATION_STATUS_LEGEND_ITEMS) {
      expect(getApplicationStatusDisplayByKey(item.key)).toEqual(item);
    }
  });
});

describe('legend copy', () => {
  it('includes status, CV missing, and draft action rows', () => {
    expect(APPLICATION_STATUS_LEGEND_ITEMS).toHaveLength(4);
    expect(CV_MISSING_LEGEND.label).toBe('CV missing');
    expect(CV_MISSING_LEGEND.description).toContain('select or upload');
    expect(CV_MISSING_LEGEND.description).not.toContain('restore a primary CV');
    expect(DRAFT_ACTION_LEGEND_ITEMS.map((item) => item.label)).toEqual([
      'Publish',
      'Preview',
      'Publish to share',
    ]);
  });
});
