import {describe,expect,it,vi} from 'vitest';
import type {JournalRepository} from '../../domain/journal/repository';
import {JournalService} from './journalService';

const repositoryWithActivityDates=(dates:string[])=>{
  const unused=async()=>{throw new Error('unused repository method')};
  const listJournalActivityDates=vi.fn(async()=>dates);
  const repository={
    initialize:async()=>undefined,
    getDailyLog:async()=>null,
    updateDayThemeMetadata:unused,
    setDayThemeForDate:unused,
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

describe('JournalService Day Theme metadata',()=>{
  it('persists and clears a validated pair through the repository boundary',async()=>{
    const updateDayThemeMetadata=vi.fn(async(_dailyLogId:string,metadata:{themeId:string|null;themeVersion:number|null})=>metadata);
    const{repository}=repositoryWithActivityDates([]);
    const service=new JournalService({...repository,updateDayThemeMetadata});
    await expect(service.setDayTheme('log-1','future-theme',2)).resolves.toEqual({themeId:'future-theme',themeVersion:2});
    await expect(service.clearDayTheme('log-1')).resolves.toEqual({themeId:null,themeVersion:null});
    expect(updateDayThemeMetadata).toHaveBeenNthCalledWith(1,'log-1',{themeId:'future-theme',themeVersion:2});
    expect(updateDayThemeMetadata).toHaveBeenNthCalledWith(2,'log-1',{themeId:null,themeVersion:null});
  });

  it('validates a date-scoped selection before persistence',async()=>{
    const savedLog={
      id:'log-1',logDate:'2026-07-29',createdAt:'now',updatedAt:'now',
      themeId:'rainy',themeVersion:1,items:[],
    };
    const setDayThemeForDate=vi.fn(async()=>savedLog);
    const{repository}=repositoryWithActivityDates([]);
    const service=new JournalService({...repository,setDayThemeForDate});
    await expect(service.setDayThemeForDate('2026-07-29',{
      themeId:'rainy',themeVersion:1,
    })).resolves.toEqual(savedLog);
    expect(setDayThemeForDate).toHaveBeenCalledWith('2026-07-29',{
      themeId:'rainy',themeVersion:1,
    });
    await expect(service.setDayThemeForDate('bad-date',{
      themeId:'rainy',themeVersion:1,
    })).rejects.toThrow();
    await expect(service.setDayThemeForDate('2026-07-29',{
      themeId:'rainy',themeVersion:null,
    })).rejects.toThrow();
    expect(setDayThemeForDate).toHaveBeenCalledOnce();
  });

  it.each([
    ['',1],
    ['Bad ID',1],
    ['x'.repeat(65),1],
    ['valid-theme',0],
    ['valid-theme',-1],
    ['valid-theme',1.5],
  ])('rejects invalid metadata before persistence (%s, %s)',async(themeId,themeVersion)=>{
    const updateDayThemeMetadata=vi.fn();
    const{repository}=repositoryWithActivityDates([]);
    const service=new JournalService({...repository,updateDayThemeMetadata});
    await expect(service.setDayTheme('log-1',themeId,themeVersion)).rejects.toThrow();
    expect(updateDayThemeMetadata).not.toHaveBeenCalled();
  });
});
