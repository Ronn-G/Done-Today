// @vitest-environment jsdom
import{cleanup,fireEvent,render,screen}from'@testing-library/react';
import{afterEach,describe,expect,it,vi}from'vitest';
import type{ImportPreview}from'../../domain/backup/preview';
import{initializeI18n}from'../../i18n';
import{ImportPreviewDialog}from'./BackupSettings';

const preview:ImportPreview={
  fileName:'done-today-backup.json',format:'done-today-backup',version:1,
  exportedAt:'2026-01-02T15:04:00Z',appVersion:'0.1.0',checksum:'sha256:abc',checksumValid:true,
  counts:{dailyLogs:1,workItems:2,workCategories:1,theme:true},
  existingIds:0,newRecords:4,conflicts:0,unchanged:0,previouslyImportedAt:null,warnings:[],
};
const props=()=>({
  value:preview,mode:'merge' as const,setMode:vi.fn(),applyTheme:false,setApplyTheme:vi.fn(),
  replaceConfirmed:false,setReplaceConfirmed:vi.fn(),reimportConfirmed:false,setReimportConfirmed:vi.fn(),
  busy:false,error:null,onCloseError:vi.fn(),cancel:vi.fn(),submit:vi.fn(),
});

afterEach(()=>cleanup());

describe('I18N-4 import dialog keyboard accessibility',()=>{
  it('moves focus into the dialog, traps Tab in both directions, handles Escape, and restores trigger focus',async()=>{
    await initializeI18n('en');
    const trigger=document.createElement('button');trigger.textContent='Restore from backup';
    document.body.append(trigger);trigger.focus();
    const value=props();
    const view=render(<ImportPreviewDialog {...value}/>);
    const dialog=screen.getByRole('dialog');
    const focusable=[...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')];
    const first=focusable[0],last=focusable.at(-1);
    expect(screen.getByRole('button',{name:'Cancel'})).toBe(document.activeElement);
    last?.focus();fireEvent.keyDown(last as HTMLElement,{key:'Tab'});
    expect(first).toBe(document.activeElement);
    first.focus();fireEvent.keyDown(first,{key:'Tab',shiftKey:true});
    expect(last).toBe(document.activeElement);
    fireEvent.keyDown(dialog,{key:'Escape'});
    expect(value.cancel).toHaveBeenCalledOnce();
    view.unmount();
    expect(trigger).toBe(document.activeElement);
    trigger.remove();
  });

  it('does not close with Escape while a destructive import is in progress',async()=>{
    await initializeI18n('vi');
    const value=props();
    render(<ImportPreviewDialog {...value} busy/>);
    fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});
    expect(value.cancel).not.toHaveBeenCalled();
  });
});
