export type ThemeSaveState='idle'|'saving'|'saved'|'error';
export class ThemeSaveCoordinator<T>{
  private timer:ReturnType<typeof setTimeout>|null=null;private pending:T|null=null;private revision=0;private latestApplied=0;
  private readonly save:(value:T)=>Promise<void>;private readonly state:(state:ThemeSaveState)=>void;private readonly delay:number;
  constructor(save:(value:T)=>Promise<void>,state:(state:ThemeSaveState)=>void,delay=550){this.save=save;this.state=state;this.delay=delay}
  schedule(value:T){this.pending=value;this.revision++;this.state('saving');if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>void this.flush().catch(()=>undefined),this.delay)}
  async flush(){if(this.timer){clearTimeout(this.timer);this.timer=null}if(!this.pending)return;const value=this.pending;this.pending=null;const revision=this.revision;
    try{await this.save(value);if(revision>=this.latestApplied){this.latestApplied=revision;this.state('saved')}}catch(error){if(revision>=this.latestApplied){this.pending=value;this.state('error')}throw error}}
  cancel(){if(this.timer)clearTimeout(this.timer);this.timer=null}
}
