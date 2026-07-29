import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(path, 'utf8');

describe('light day personalization compatibility evidence', () => {
  it('keeps the personalization dialog behind a lazy boundary', () => {
    const app = source('src/app/App.tsx');
    expect(app).toContain('LazyDayPersonalizationDialog = lazy');
    expect(app).toContain(
      "import('../features/daily-log/DayPersonalizationDialog')",
    );
    expect(app).not.toMatch(
      /^import .*DayPersonalizationDialog.*from .*DayPersonalizationDialog/m,
    );
  });

  it('keeps Calendar and History on lightweight summary data without motif loaders', () => {
    const calendar = source('src/features/history/HistoryMonthCalendar.tsx');
    const app = source('src/app/App.tsx');
    const native = source('src-tauri/src/lib.rs');
    expect(calendar).not.toMatch(/loadDayThemeAsset|motifAssetId|DayCover/);
    expect(app).toContain('summary.daySymbol');
    expect(native).toContain(
      'd.updated_at,d.theme_id,d.theme_version,d.day_symbol',
    );
    expect(native).toContain(
      '"SELECT log_date,theme_id,theme_version,day_symbol',
    );
  });

  it('retains reduced-motion and forced-colors coverage for the new controls', () => {
    const styles = source('src/styles.css');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('@media (forced-colors: active)');
    expect(styles).toContain('.day-personalization-options button.selected');
  });
});
