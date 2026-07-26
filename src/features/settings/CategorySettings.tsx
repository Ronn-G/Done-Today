/* eslint-disable react-hooks/set-state-in-effect,react-hooks/exhaustive-deps -- initial repository load */
import{useEffect,useState}from'react';
import{useTranslation}from'react-i18next';
import{ChevronDown,ChevronUp,Eye,EyeOff,LoaderCircle,Plus}from'lucide-react';
import{normalizeAppError}from'../../application/errors/errorNormalizer';
import type{NormalizedAppError}from'../../domain/errors/appError';
import{categoryInputSchema,type WorkCategory}from'../../domain/journal/categories';
import{normalizeHexColor}from'../../domain/theme/colors';
import{JournalService}from'../../application/journal/journalService';
import{localizeAppError,toErrorTranslator}from'../../i18n/errorPresentation';

type CategoryService=Pick<JournalService,'listCategories'|'createCategory'|'updateCategory'|'reorderCategories'>;
export type CategorySettingsError='load'|'invalid'|'update'|'reorder'|'nameRequired'|'nameMax'|'colorHex';
type CategorySettingsFailure=CategorySettingsError|NormalizedAppError;
type CategoryRetryAction={kind:'load'}|{kind:'create'}|{kind:'update';id:string}|null;
type CategoryPatch=Partial<Pick<WorkCategory,'name'|'color'|'isActive'>>;
export type CategorySettingsViewProps={
  categories:WorkCategory[];loading:boolean;error:CategorySettingsFailure|null;name:string;color:string;
  onNameChange:(value:string)=>void;onColorChange:(value:string)=>void;onHexChange:(value:string)=>void;
  onCreate:()=>void;onEdit:(category:WorkCategory,patch:CategoryPatch)=>void;
  onSave:(category:WorkCategory,patch:CategoryPatch)=>void;onMove:(index:number,direction:-1|1)=>void;onRetry:()=>void;
};

export function CategorySettingsView({categories,loading,error,name,color,onNameChange,onColorChange,onHexChange,onCreate,onEdit,onSave,onMove,onRetry}:CategorySettingsViewProps){
  const{t}=useTranslation('settings');
  const{t:tErrors}=useTranslation('errors');
  const errorMessage=error==='load'?t('categories.errors.load'):
    error==='invalid'?t('categories.errors.invalid'):
    error==='update'?t('categories.errors.update'):
    error==='reorder'?t('categories.errors.reorder'):
    error==='nameRequired'?t('categories.validation.nameRequired'):
    error==='nameMax'?t('categories.validation.nameMax'):
    error==='colorHex'?t('categories.validation.colorHex'):
    error&&typeof error==='object'?localizeAppError(error,toErrorTranslator(tErrors)):null;
  const errorDescription=error==='nameRequired'||error==='nameMax'||error==='colorHex'?'category-settings-error':undefined;
  return <section className="settings-card category-settings" aria-labelledby="work-categories-heading">
    <h2 id="work-categories-heading">{t('categories.heading.title')}</h2><p>{t('categories.heading.description')}</p>
    <div className="category-create">
      <input aria-label={t('categories.create.nameLabel')} aria-describedby={errorDescription} maxLength={100} placeholder={t('categories.create.namePlaceholder')} value={name} onChange={event=>onNameChange(event.target.value)}/>
      <input aria-label={t('categories.create.colorLabel')} aria-describedby={errorDescription} type="color" value={color} onChange={event=>onColorChange(event.target.value)}/>
      <input aria-label={t('categories.create.hexLabel')} aria-describedby={errorDescription} value={color} onChange={event=>onHexChange(event.target.value)}/>
      <button type="button" onClick={onCreate}><Plus size={16}/> {t('categories.create.action')}</button>
    </div>
    {loading?<div className="message" role="status" aria-live="polite" aria-atomic="true"><LoaderCircle className="spin"/> {t('categories.status.loading')}</div>:
      <div className="category-list" role="list" aria-label={t('categories.accessibility.list')}>{categories.map((category,index)=>
        <div className="category-editor" role="listitem" aria-label={t('categories.item.rowLabel',{name:category.name})} key={category.id}>
          <i style={{backgroundColor:category.color}}/>
          <input aria-label={t('categories.item.nameLabel',{name:category.name})} aria-describedby={errorDescription} value={category.name} maxLength={100}
            onChange={event=>onEdit(category,{name:event.target.value})} onBlur={()=>onSave(category,{name:category.name})}/>
          <input aria-label={t('categories.item.colorLabel',{name:category.name})} aria-describedby={errorDescription} type="color" value={category.color} onChange={event=>onSave(category,{color:event.target.value})}/>
          <button type="button" aria-label={t('categories.item.moveUp',{name:category.name})} disabled={index===0} onClick={()=>onMove(index,-1)}><ChevronUp size={15}/></button>
          <button type="button" aria-label={t('categories.item.moveDown',{name:category.name})} disabled={index===categories.length-1} onClick={()=>onMove(index,1)}><ChevronDown size={15}/></button>
          <button type="button" aria-label={category.isActive?t('categories.item.hide',{name:category.name}):t('categories.item.show',{name:category.name})} onClick={()=>onSave(category,{isActive:!category.isActive})}>{category.isActive?<Eye size={16}/>:<EyeOff size={16}/>}</button>
          <span>{category.isActive?t('categories.status.active'):t('categories.status.inactive')}</span>
        </div>)}</div>}
    {errorMessage&&<div className="page-error" id="category-settings-error" role="alert">{errorMessage}<button type="button" onClick={onRetry}>{t('common:actions.retry')}</button></div>}
  </section>;
}

export function applyCategoryPatch(category:WorkCategory,patch:CategoryPatch){return{...category,...patch}}
export function validateCategoryValues(name:string,color:string):CategorySettingsError|null{
  const result=categoryInputSchema.safeParse({name,color});if(result.success)return null;
  const issue=result.error.issues[0];const field=issue?.path[0];
  if(field==='name')return issue.code==='too_big'?'nameMax':'nameRequired';
  if(field==='color')return'colorHex';
  return'invalid';
}
export async function createCategory(service:CategoryService,name:string,color:string){return service.createCategory({name,color})}
export async function updateCategory(service:CategoryService,category:WorkCategory,patch:CategoryPatch){
  const next=applyCategoryPatch(category,patch);
  return service.updateCategory(category.id,{name:next.name,color:next.color,isActive:next.isActive});
}
export async function reorderCategories(service:CategoryService,categories:WorkCategory[],index:number,direction:-1|1){
  const target=index+direction;if(target<0||target>=categories.length)return null;
  const next=[...categories];[next[index],next[target]]=[next[target],next[index]];
  return{optimistic:next,saved:await service.reorderCategories(next.map(value=>value.id))};
}

export function CategorySettings({service}:{service:CategoryService}){
  const[categories,setCategories]=useState<WorkCategory[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState<CategorySettingsFailure|null>(null);
  const[retryAction,setRetryAction]=useState<CategoryRetryAction>(null);
  const[name,setName]=useState('');const[color,setColor]=useState('#4F7CAC');
  const load=async()=>{setLoading(true);try{setCategories(await service.listCategories(true));setError(null);setRetryAction(null)}catch(reason){setError(normalizeAppError(reason));setRetryAction({kind:'load'})}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  const create=async()=>{const validation=validateCategoryValues(name,color);if(validation){setError(validation);setRetryAction({kind:'create'});return}try{const created=await createCategory(service,name,color);setCategories(current=>[...current,created]);setName('');setError(null);setRetryAction(null)}catch(reason){setError(normalizeAppError(reason));setRetryAction({kind:'create'})}};
  const save=async(category:WorkCategory,patch:CategoryPatch)=>{
    const next=applyCategoryPatch(category,patch);const validation=validateCategoryValues(next.name,next.color);if(validation){setError(validation);setRetryAction({kind:'update',id:category.id});return}
    setCategories(current=>current.map(value=>value.id===category.id?applyCategoryPatch(value,patch):value));
    try{const saved=await updateCategory(service,category,patch);setCategories(current=>current.map(value=>value.id===saved.id?saved:value));setError(null);setRetryAction(null)}
    catch(reason){setError(normalizeAppError(reason));setRetryAction({kind:'update',id:category.id})}
  };
  const move=async(index:number,direction:-1|1)=>{
    const target=index+direction;if(target<0||target>=categories.length)return;
    const optimistic=[...categories];[optimistic[index],optimistic[target]]=[optimistic[target],optimistic[index]];setCategories(optimistic);
    try{const result=await reorderCategories(service,categories,index,direction);if(result)setCategories(result.saved);setError(null)}
    catch(reason){const failure=normalizeAppError(reason);void load().finally(()=>setError(failure))}
  };
  const retry=()=>{if(retryAction?.kind==='create'){void create();return}if(retryAction?.kind==='update'){
    const current=categories.find(category=>category.id===retryAction.id);if(current){void save(current,{});return}
  }void load()};
  return <CategorySettingsView categories={categories} loading={loading} error={error} name={name} color={color}
    onNameChange={setName} onColorChange={setColor}
    onHexChange={value=>{const normalized=normalizeHexColor(value);if(normalized)setColor(normalized)}}
    onCreate={()=>void create()}
    onEdit={(category,patch)=>setCategories(current=>current.map(value=>value.id===category.id?applyCategoryPatch(value,patch):value))}
    onSave={(category,patch)=>void save(category,patch)}
    onMove={(index,direction)=>void move(index,direction)} onRetry={retry}/>;
}
