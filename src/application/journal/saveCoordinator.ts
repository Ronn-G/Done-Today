export type SaveState='idle'|'saving'|'saved'|'error';
export class SaveCoordinator<T,R=T>{
  private sequence=0;
  private timer:ReturnType<typeof setTimeout>|null=null;
  private pending:T|null=null;
  private readonly save:(value:T)=>Promise<R>;
  private readonly onSaved:(value:R)=>void;
  private readonly onState:(state:SaveState)=>void;
  private readonly delay:number;
  constructor(save:(value:T)=>Promise<R>,onSaved:(value:R)=>void,onState:(state:SaveState)=>void,delay=600){
    this.save=save;this.onSaved=onSaved;this.onState=onState;this.delay=delay;
  }
  schedule(value:T){
    this.sequence++;
    this.pending=value;
    if(this.timer)clearTimeout(this.timer);
    this.timer=setTimeout(()=>void this.flush(),this.delay);
  }
  async flush(){
    if(this.timer){clearTimeout(this.timer);this.timer=null}
    if(this.pending===null)return;
    const value=this.pending;this.pending=null;
    const current=this.sequence;this.onState('saving');
    try{
      const saved=await this.save(value);
      if(current===this.sequence){this.onSaved(saved);this.onState('saved')}
    }catch(error){
      if(current===this.sequence){this.pending=value;this.onState('error')}
      throw error;
    }
  }
  cancel(){if(this.timer)clearTimeout(this.timer);this.timer=null}
}
