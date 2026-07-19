export type SaveState='idle'|'saving'|'saved'|'error';
const activeCoordinators=new Set<SaveCoordinator<unknown,unknown>>();
const inFlightSaves=new Set<Promise<unknown>>();
export async function flushPendingJournalSaves(){
  await Promise.all([...activeCoordinators].map(value=>value.flush()));
  await Promise.all([...inFlightSaves]);
}
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
    activeCoordinators.add(this as unknown as SaveCoordinator<unknown,unknown>);
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
      const request=this.save(value);inFlightSaves.add(request);
      const saved=await request.finally(()=>inFlightSaves.delete(request));
      if(current===this.sequence){this.onSaved(saved);this.onState('saved')}
    }catch(error){
      if(current===this.sequence){this.pending=value;this.onState('error')}
      throw error;
    }
  }
  cancel(){if(this.timer)clearTimeout(this.timer);this.timer=null;activeCoordinators.delete(this as unknown as SaveCoordinator<unknown,unknown>)}
}
