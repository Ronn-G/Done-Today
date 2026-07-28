import {invoke} from '@tauri-apps/api/core';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {TauriJournalRepository} from './tauriJournalRepository';

vi.mock('@tauri-apps/api/core',()=>({invoke:vi.fn()}));

describe('TauriJournalRepository journal activity dates',()=>{
  beforeEach(()=>vi.mocked(invoke).mockReset());

  it('uses the typed activity-date command without sending journal data to the UI',async()=>{
    vi.mocked(invoke).mockResolvedValue(['2026-07-23','2026-07-24']);
    await expect(new TauriJournalRepository().listJournalActivityDates()).resolves.toEqual([
      '2026-07-23','2026-07-24',
    ]);
    expect(invoke).toHaveBeenCalledWith('list_journal_activity_dates');
  });

  it('preserves malformed strings for the safe domain filter but rejects non-string data',async()=>{
    vi.mocked(invoke).mockResolvedValueOnce(['bad-date','2026-07-24']);
    await expect(new TauriJournalRepository().listJournalActivityDates()).resolves.toEqual([
      'bad-date','2026-07-24',
    ]);
    vi.mocked(invoke).mockResolvedValueOnce(['2026-07-24',42]);
    await expect(new TauriJournalRepository().listJournalActivityDates()).rejects.toThrow();
  });
});

describe('TauriJournalRepository Day Theme metadata',()=>{
  beforeEach(()=>vi.mocked(invoke).mockReset());

  it('writes the pair with one typed command and accepts unknown valid IDs',async()=>{
    vi.mocked(invoke).mockResolvedValue({themeId:'future-theme',themeVersion:7});
    await expect(new TauriJournalRepository().updateDayThemeMetadata('log-1',{
      themeId:'future-theme',themeVersion:7,
    })).resolves.toEqual({themeId:'future-theme',themeVersion:7});
    expect(invoke).toHaveBeenCalledWith('update_daily_log_day_theme',{
      dailyLogId:'log-1',themeId:'future-theme',themeVersion:7,
    });
  });

  it('rejects a malformed native pair',async()=>{
    vi.mocked(invoke).mockResolvedValue({themeId:'future-theme',themeVersion:null});
    await expect(new TauriJournalRepository().updateDayThemeMetadata('log-1',{
      themeId:'future-theme',themeVersion:7,
    })).rejects.toThrow();
  });
});
