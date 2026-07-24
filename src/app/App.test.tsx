import {describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {initializeI18n} from '../i18n';
import {AppNavigation,TodayOverview} from './App';

describe('I18N-2 app shell and Today overview',()=>{
  it.each([
    ['vi',['Hôm nay','Lịch sử','Cài đặt']],
    ['en',['Today','History','Settings']],
  ] as const)('renders navigation in %s',async(locale,labels)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<AppNavigation activePage="day" onNavigate={vi.fn()}/>);
    for(const label of labels)expect(html).toContain(label);
  });

  it.each([
    ['vi','Nhật ký theo ngày','Ngày trước','Tỷ lệ hoàn thành'],
    ['en','Daily journal','Previous day','Completion rate'],
  ] as const)('renders localized dates, controls and statistics in %s',async(locale,eyebrow,previous,completionRate)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<TodayOverview date="2026-01-02" stats={{total:2,completed:1,percentage:50}} onGo={vi.fn()} onOpenTheme={vi.fn()}/>);
    expect(html).toContain(eyebrow);
    expect(html).toContain(`aria-label="${previous}"`);
    expect(html).toContain(completionRate);
    expect(html).toContain('50%');
    if(locale==='en')expect(html).toContain('Friday, January 2, 2026');
    else expect(html).toContain('tháng 1');
  });
});
