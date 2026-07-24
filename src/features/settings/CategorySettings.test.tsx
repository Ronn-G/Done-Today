import{describe,expect,it,vi}from'vitest';
import{renderToStaticMarkup}from'react-dom/server';
import{initializeI18n}from'../../i18n';
import type{WorkCategory}from'../../domain/journal/categories';
import{
  CategorySettingsView,applyCategoryPatch,createCategory,reorderCategories,updateCategory,
  validateCategoryValues,type CategorySettingsError,type CategorySettingsViewProps,
}from'./CategorySettings';

const category:WorkCategory={
  id:'category-42',name:'Công việc của Lan',color:'#4F7CAC',position:3,isActive:true,
  createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',
};
const callbacks=()=>({
  onNameChange:vi.fn(),onColorChange:vi.fn(),onHexChange:vi.fn(),onCreate:vi.fn(),
  onEdit:vi.fn(),onSave:vi.fn(),onMove:vi.fn(),onRetry:vi.fn(),
});
const renderView=(overrides:Partial<CategorySettingsViewProps>={})=>{
  const actions=callbacks();
  const props:CategorySettingsViewProps={
    categories:[category],loading:false,error:null,name:'Bản nháp giữ nguyên',color:'#112233',...actions,...overrides,
  };
  return{html:renderToStaticMarkup(<CategorySettingsView {...props}/>),actions,props};
};

describe('CategorySettings localization',()=>{
  it('renders the complete existing Vietnamese workflow with accessible names',async()=>{
    await initializeI18n('vi');const{html}=renderView();
    for(const copy of ['Nhóm công việc','Tạo và sắp xếp','Tên nhóm mới','Màu nhóm mới','Mã HEX nhóm mới','Tạo nhóm','Đang hiện']){
      expect(html).toContain(copy);
    }
    expect(html).toContain('aria-label="Danh sách nhóm công việc"');
    expect(html).toContain('aria-label="Di chuyển Công việc của Lan lên"');
    expect(html).toContain('aria-label="Ẩn nhóm Công việc của Lan"');
    expect(html).toContain('Bản nháp giữ nguyên');expect(html).toContain('#112233');
  });

  it('switches system copy to English while preserving persisted data and draft without side effects',async()=>{
    await initializeI18n('vi');const before=renderView();
    await initializeI18n('en');const after=renderView();
    for(const copy of ['Work categories','Create and arrange','New category name','New category color','New category HEX code','Create category','Visible']){
      expect(after.html).toContain(copy);
    }
    expect(after.html).toContain('aria-label="Work category list"');
    expect(after.html).toContain('aria-label="Move Công việc của Lan up"');
    expect(after.html).toContain('aria-label="Hide category Công việc của Lan"');
    for(const value of [category.name,category.color,'Bản nháp giữ nguyên','#112233']){
      expect(before.html).toContain(value);expect(after.html).toContain(value);
    }
    expect(category).toMatchObject({id:'category-42',name:'Công việc của Lan',color:'#4F7CAC',position:3,isActive:true});
    expect(Object.values(after.actions).every(action=>action.mock.calls.length===0)).toBe(true);
    expect(after.html).not.toContain('categories.');expect(after.html).not.toContain('settings.');
  });

  it.each([
    ['load','Couldn’t load work categories.'],['invalid','The category name or color is invalid.'],
    ['update','Couldn’t update the work category.'],['reorder','Couldn’t change the category order.'],
    ['nameRequired','Enter a category name.'],['nameMax','Category names can be up to 100 characters.'],
    ['colorHex','Use a HEX color in the format #RRGGBB.'],
  ]as const)('renders the safe localized %s error and retry action',async(error,copy)=>{
    await initializeI18n('en');const{html}=renderView({error:error as CategorySettingsError});
    expect(html).toContain('role="alert"');expect(html).toContain(copy);expect(html).toContain('>Retry</button>');
    expect(html).toContain('id="category-settings-error"');
    if(error==='nameRequired'||error==='nameMax'||error==='colorHex')expect(html).toContain('aria-describedby="category-settings-error"');
    for(const unsafe of ['SQLITE_CONSTRAINT','C:\\Users\\long','SELECT *','stack trace'])expect(html).not.toContain(unsafe);
  });

  it('keeps the technical error state and only changes safe copy when locale changes',async()=>{
    await initializeI18n('vi');const before=renderView({error:'load'});
    await initializeI18n('en');const after=renderView({error:'load'});
    expect(before.html).toContain('Không thể tải nhóm công việc.');
    expect(after.html).toContain('Couldn’t load work categories.');
    expect(Object.values(before.actions).every(action=>action.mock.calls.length===0)).toBe(true);
    expect(Object.values(after.actions).every(action=>action.mock.calls.length===0)).toBe(true);
  });

  it('announces the localized loading state without fetching during render',async()=>{
    await initializeI18n('vi');const{html,actions}=renderView({loading:true,categories:[]});
    expect(html).toContain('role="status"');expect(html).toContain('aria-live="polite"');expect(html).toContain('Đang tải nhóm…');
    expect(Object.values(actions).every(action=>action.mock.calls.length===0)).toBe(true);
  });
});

describe('CategorySettings behavior helpers',()=>{
  it('maps canonical required, max-length, and HEX rules to locale-neutral presentation states',()=>{
    expect(validateCategoryValues(' ','#112233')).toBe('nameRequired');
    expect(validateCategoryValues('x'.repeat(101),'#112233')).toBe('nameMax');
    expect(validateCategoryValues('Học tập','red')).toBe('colorHex');
    expect(validateCategoryValues(' Học tập ','#4F8A65')).toBe(null);
  });
  it('keeps stable category data and sends the exact create/update/reactivation payloads',async()=>{
    const created={...category,id:'created'};const updated={...category,name:'Tên mới'};const restored={...category,isActive:true};
    const service={
      listCategories:vi.fn(),reorderCategories:vi.fn(),
      createCategory:vi.fn(async()=>created),
      updateCategory:vi.fn(async(_id:string,input:{name:string;color:string;isActive:boolean})=>input.isActive?updated:restored),
    };
    await expect(createCategory(service,'Tên mới','#AABBCC')).resolves.toBe(created);
    expect(service.createCategory).toHaveBeenCalledWith({name:'Tên mới',color:'#AABBCC'});
    await updateCategory(service,category,{name:'Tên mới'});
    expect(service.updateCategory).toHaveBeenLastCalledWith('category-42',{name:'Tên mới',color:'#4F7CAC',isActive:true});
    const hidden=applyCategoryPatch(category,{isActive:false});
    expect(hidden).toMatchObject({id:'category-42',name:'Công việc của Lan',color:'#4F7CAC',position:3,isActive:false});
    await updateCategory(service,category,{isActive:false});
    expect(service.updateCategory).toHaveBeenLastCalledWith('category-42',{name:'Công việc của Lan',color:'#4F7CAC',isActive:false});
    await updateCategory(service,hidden,{isActive:true});
    expect(service.updateCategory).toHaveBeenLastCalledWith('category-42',{name:'Công việc của Lan',color:'#4F7CAC',isActive:true});
    const latestDraft={...category,name:'Bản nháp mới nhất sau lỗi',color:'#778899'};
    await updateCategory(service,latestDraft,{});
    expect(service.updateCategory).toHaveBeenLastCalledWith('category-42',{name:'Bản nháp mới nhất sau lỗi',color:'#778899',isActive:true});
  });

  it('reorders with every stable ID and never creates a virtual uncategorized record',async()=>{
    const second={...category,id:'category-99',name:'Khách hàng ACME',position:4};
    const service={
      listCategories:vi.fn(),createCategory:vi.fn(),updateCategory:vi.fn(),
      reorderCategories:vi.fn(async()=>[second,category]),
    };
    const result=await reorderCategories(service,[category,second],0,1);
    expect(service.reorderCategories).toHaveBeenCalledWith(['category-99','category-42']);
    expect(result?.optimistic.map(value=>value.id)).toEqual(['category-99','category-42']);
    expect(service.createCategory).not.toHaveBeenCalled();
    expect(result?.optimistic.some(value=>value.id===null)).toBe(false);
  });
});
