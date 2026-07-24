import {readFileSync} from 'node:fs';
import {describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import type {CategoryGroup,WorkCategory} from '../domain/journal/categories';
import {i18next,initializeI18n} from '../i18n';
import {AddRowFooter,submitAddRowCategorySelection,TodayCategoryHeader,TodayEmptyState,TodayTableHeader} from './App';

const category:WorkCategory={
  id:'category-42',name:'Khách hàng ACME',color:'#4F7CAC',position:0,isActive:true,
  createdAt:'2026-07-24T00:00:00Z',updatedAt:'2026-07-24T00:00:00Z',
};
const group:CategoryGroup={
  id:category.id,category,name:category.name,color:category.color,isActive:true,
  items:[],totalItems:1,completedItems:0,
};
const virtualGroup:CategoryGroup={
  id:null,category:null,name:null,color:null,isActive:true,items:[],totalItems:2,completedItems:1,
};
const renderTableChrome=(target:CategoryGroup,categories:WorkCategory[],onAddItem=vi.fn(),onToggle=vi.fn())=>
  renderToStaticMarkup(<><table><TodayTableHeader/><tbody><TodayCategoryHeader group={target} hidden={false} onAddItem={onAddItem} onToggle={onToggle}/><TodayEmptyState/></tbody></table><AddRowFooter categories={categories} onAddItem={onAddItem}/></>);

describe('I18N-2 Today table and add-row flow',()=>{
  it('renders Vietnamese table, category, empty and add-row copy',async()=>{
    await initializeI18n('vi');
    const html=renderTableChrome(group,[category]);
    for(const text of ['Bảng công việc trong ngày','Thứ tự','Việc đã làm','Kết quả','Bước tiếp theo','Trạng thái','Hành động','Chưa có việc nào.','Thêm dòng vào','Chọn nhóm…','Việc khác']){
      expect(html).toContain(text);
    }
    expect(html).toContain('Đã hoàn thành 0/1 việc');
    expect(html).toContain('<caption class="sr-only">Bảng công việc trong ngày</caption>');
    expect(html).toContain('aria-label="Thêm việc vào Khách hàng ACME"');
    expect(html).toContain('aria-label="Thu gọn Khách hàng ACME"');
    expect(html).toContain('value="category-42"');
    expect(i18next.t('today:status.loading')).toBe('Đang đọc dữ liệu…');
    expect(html).not.toContain('today.');
  });

  it('switches the same view data to English without mutating or writing user category data',async()=>{
    const onAddItem=vi.fn();const onToggle=vi.fn();
    await initializeI18n('vi');const vietnamese=renderTableChrome(group,[category],onAddItem,onToggle);
    await initializeI18n('en');const english=renderTableChrome(group,[category],onAddItem,onToggle);
    expect(vietnamese).toContain('Chọn nhóm cho dòng mới');
    for(const text of ['Daily work table','Order','Work done','Result','Next step','Status','Actions','No tasks yet.','Add row to','Choose a category…']){
      expect(english).toContain(text);
    }
    expect(english).toContain('0 of 1 task completed');
    expect(english).toContain('Khách hàng ACME');
    expect(english).toContain('aria-label="Add a task to Khách hàng ACME"');
    expect(english).toContain('aria-label="Collapse Khách hàng ACME"');
    expect(english).toContain('aria-label="Choose a category for the new row"');
    expect(english).toContain('value="category-42"');
    expect(i18next.t('today:status.loading')).toBe('Loading journal…');
    expect(category).toMatchObject({id:'category-42',name:'Khách hàng ACME'});
    expect(onAddItem).not.toHaveBeenCalled();expect(onToggle).not.toHaveBeenCalled();
    expect(english).not.toContain('today.');
  });

  it('localizes only the virtual null-group label and preserves its null identity',async()=>{
    await initializeI18n('vi');const vietnamese=renderTableChrome(virtualGroup,[]);
    await initializeI18n('en');const english=renderTableChrome(virtualGroup,[]);
    expect(vietnamese).toContain('Thêm việc vào Việc khác');
    expect(vietnamese).toContain('Đã hoàn thành 1/2 việc');
    expect(english).toContain('Add a task to Other');
    expect(english).toContain('1 of 2 tasks completed');
    const collapsed=renderToStaticMarkup(<table><tbody><TodayCategoryHeader group={virtualGroup} hidden onAddItem={vi.fn()} onToggle={vi.fn()}/></tbody></table>);
    expect(collapsed).toContain('aria-label="Expand Other"');
    expect(virtualGroup).toMatchObject({id:null,category:null,name:null});
  });

  it('uses the table-header semantic variable only for the Today column-header surface',async()=>{
    await initializeI18n('vi');
    const html=renderTableChrome(group,[category]);
    const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
    const tableHeaderRule=styles.match(/thead th\s*\{([^}]*)\}/)?.[1];
    const categoryHeaderRule=styles.match(/\.category-row th\s*\{([^}]*)\}/)?.[1];
    expect(html).toContain('<thead>');
    expect(html).toContain('<tr class="category-row">');
    expect(tableHeaderRule).toContain('background: var(--bg-table-header)');
    expect(categoryHeaderRule).not.toContain('var(--bg-table-header)');
  });

  it('keeps add-row behavior and category IDs stable while mapping only the virtual option to null',()=>{
    const onAddItem=vi.fn();
    expect(submitAddRowCategorySelection('',onAddItem)).toBe(false);
    expect(submitAddRowCategorySelection('category-42',onAddItem)).toBe(true);
    expect(submitAddRowCategorySelection('__other__',onAddItem)).toBe(true);
    expect(onAddItem.mock.calls).toEqual([['category-42'],[null]]);
  });
});
