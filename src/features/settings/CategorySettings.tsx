/* eslint-disable react-hooks/set-state-in-effect,react-hooks/exhaustive-deps -- initial repository load */
import{useEffect,useState}from'react';
import{ChevronDown,ChevronUp,Eye,EyeOff,LoaderCircle,Plus}from'lucide-react';
import type{WorkCategory}from'../../domain/journal/categories';
import{normalizeHexColor}from'../../domain/theme/colors';
import{JournalService}from'../../application/journal/journalService';

export function CategorySettings({service}:{service:JournalService}){
  const[categories,setCategories]=useState<WorkCategory[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);
  const[name,setName]=useState('');const[color,setColor]=useState('#4F7CAC');
  const load=async()=>{setLoading(true);try{setCategories(await service.listCategories(true));setError(null)}catch{setError('Không thể tải nhóm công việc.')}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  const create=async()=>{try{const created=await service.createCategory({name,color});setCategories(current=>[...current,created]);setName('')}catch{setError('Tên hoặc màu nhóm không hợp lệ.')}};
  const save=async(category:WorkCategory,patch:Partial<WorkCategory>)=>{try{const next={...category,...patch};const saved=await service.updateCategory(category.id,{name:next.name,color:next.color,isActive:next.isActive});setCategories(current=>current.map(value=>value.id===saved.id?saved:value));setError(null)}catch{setError('Không thể cập nhật nhóm công việc.')}};
  const move=async(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=categories.length)return;const next=[...categories];[next[index],next[target]]=[next[target],next[index]];setCategories(next);try{setCategories(await service.reorderCategories(next.map(value=>value.id)))}catch{setError('Không thể thay đổi thứ tự nhóm.');void load()}};
  return <section className="settings-card category-settings"><h2>Nhóm công việc</h2><p>Tạo và sắp xếp các nhóm hiển thị trong bảng Hôm nay.</p>
    <div className="category-create"><input aria-label="Tên nhóm mới" maxLength={100} placeholder="Tên nhóm mới" value={name} onChange={event=>setName(event.target.value)}/><input aria-label="Màu nhóm mới" type="color" value={color} onChange={event=>setColor(event.target.value)}/><input aria-label="Mã HEX nhóm mới" value={color} onChange={event=>{const value=normalizeHexColor(event.target.value);if(value)setColor(value)}}/><button onClick={()=>void create()}><Plus size={16}/> Tạo nhóm</button></div>
    {loading?<div className="message"><LoaderCircle className="spin"/> Đang tải nhóm…</div>:<div className="category-list">{categories.map((category,index)=><div className="category-editor" key={category.id}><i style={{backgroundColor:category.color}}/><input aria-label={`Tên nhóm ${category.name}`} value={category.name} maxLength={100} onChange={event=>setCategories(current=>current.map(value=>value.id===category.id?{...value,name:event.target.value}:value))} onBlur={()=>void save(category,{name:categories.find(value=>value.id===category.id)?.name})}/><input aria-label={`Màu nhóm ${category.name}`} type="color" value={category.color} onChange={event=>void save(category,{color:event.target.value})}/><button aria-label={`Di chuyển ${category.name} lên`} disabled={index===0} onClick={()=>void move(index,-1)}><ChevronUp size={15}/></button><button aria-label={`Di chuyển ${category.name} xuống`} disabled={index===categories.length-1} onClick={()=>void move(index,1)}><ChevronDown size={15}/></button><button aria-label={`${category.isActive?'Ẩn':'Hiện'} nhóm ${category.name}`} onClick={()=>void save(category,{isActive:!category.isActive})}>{category.isActive?<Eye size={16}/>:<EyeOff size={16}/>}</button><span>{category.isActive?'Đang hiện':'Đã ẩn'}</span></div>)}</div>}
    {error&&<div className="page-error">{error}<button onClick={()=>void load()}>Thử lại</button></div>}
  </section>;
}
