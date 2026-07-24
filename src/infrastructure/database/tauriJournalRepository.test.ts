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
