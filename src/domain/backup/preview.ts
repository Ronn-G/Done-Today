import type {BackupEnvelopeV1,BackupPayloadV1}from'./models';
export type ImportMode='merge'|'replace';
export type BackupCounts={dailyLogs:number;workItems:number;workCategories:number;theme:boolean};
export type ImportPreview={fileName:string;format:string;version:number;exportedAt:string;appVersion:string;checksum:string;
  checksumValid:boolean;counts:BackupCounts;existingIds:number;newRecords:number;conflicts:number;unchanged:number;
  previouslyImportedAt:string|null;warnings:string[]};
export const payloadCounts=(payload:BackupPayloadV1):BackupCounts=>({dailyLogs:payload.dailyLogs.length,
  workItems:payload.workItems.length,workCategories:payload.workCategories.length,theme:payload.themePreferences!==null});
export function envelopeSummary(envelope:BackupEnvelopeV1,fileName:string):ImportPreview{
  const counts=payloadCounts(envelope.payload);return{fileName,format:envelope.format,version:envelope.version,
    exportedAt:envelope.exportedAt,appVersion:envelope.appVersion,checksum:envelope.checksum,checksumValid:true,counts,
    existingIds:0,newRecords:counts.dailyLogs+counts.workItems+counts.workCategories,conflicts:0,unchanged:0,
    previouslyImportedAt:null,warnings:[]};
}
