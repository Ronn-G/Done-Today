import {describe,expect,it,vi} from 'vitest';
import type {JournalRepository} from '../../domain/journal/repository';
import {JournalService} from './journalService';

const repositoryWithActivityDates=(dates:string[])=>{
  const unused=async()=>{throw new Error('unused repository method')};
  const listJournalActivityDates=vi.fn(async()=>dates);
  const repository={
    initialize:async()=>undefined,
    getDailyLog:async()=>null,
    createWorkItem:unused,
    updateWorkItem:unused,
    deleteWorkItem:async()=>undefined,
    reorderWorkItems:async()=>[],
    listCategories:async()=>[],
    createCategory:unused,
    updateCategory:unused,
    archiveCategory:unused,
    reorderCategories:async()=>[],
    assignWorkItemCategory:unused,
    listDailyLogSummaries:unused,
    listJournalActivityDates,
  } satisfies JournalRepository;
  return{repository,listJournalActivityDates};
};

describe('JournalService current streak',()=>{
  it('loads activity dates through the repository and applies the supplied local today key',async()=>{
    const{repository,listJournalActivityDates}=repositoryWithActivityDates([
      '2026-07-21','2026-07-22','2026-07-23','2099-01-01',
    ]);
    const service=new JournalService(repository);
    await expect(service.getCurrentStreak('2026-07-24')).resolves.toBe(3);
    expect(listJournalActivityDates).toHaveBeenCalledOnce();
  });

  it('handles malformed adapter strings safely instead of crashing the UI',async()=>{
    const{repository}=repositoryWithActivityDates(['not-a-date','2026-02-31','2026-07-24']);
    await expect(new JournalService(repository).getCurrentStreak('2026-07-24')).resolves.toBe(1);
  });
});
