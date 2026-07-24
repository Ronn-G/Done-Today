import {describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
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
    ['vi','Nhật ký theo ngày','Ngày trước','Tỷ lệ hoàn thành','Tùy chỉnh giao diện'],
    ['en','Daily journal','Previous day','Completion rate','Customize appearance'],
  ] as const)('renders localized dates, controls and statistics in %s',async(locale,eyebrow,previous,completionRate,customizeAppearance)=>{
    await initializeI18n(locale);
    const html=renderToStaticMarkup(<TodayOverview date="2026-01-02" stats={{total:2,completed:1,percentage:50}} currentStreak={6} onGo={vi.fn()} onOpenTheme={vi.fn()}/>);
    expect(html).toContain(eyebrow);
    expect(html).toContain(`aria-label="${previous}"`);
    expect(html).toContain(`aria-label="${customizeAppearance}"`);
    expect(html).toContain(completionRate);
    expect(html).toContain('50%');
    if(locale==='en')expect(html).toContain('Friday, January 2, 2026');
    else expect(html).toContain('tháng 1');
  });

  it('renders the fourth statistic in Vietnamese without a raw key',async()=>{
    await initializeI18n('vi');
    const html=renderToStaticMarkup(<TodayOverview date="2026-01-02" stats={{total:0,completed:0,percentage:0}} currentStreak={0} onGo={vi.fn()} onOpenTheme={vi.fn()}/>);
    expect(html).toContain('aria-label="Thống kê trong ngày"');
    expect(html).toContain('class="stat streak-stat"');
    expect(html).toContain('Chuỗi ngày ghi nhật ký');expect(html).toContain('0 ngày');
    expect(html).not.toContain('today.');
  });

  it('uses English singular and plural streak values while preserving existing stats',async()=>{
    await initializeI18n('en');
    const one=renderToStaticMarkup(<TodayOverview date="2026-01-02" stats={{total:2,completed:1,percentage:50}} currentStreak={1} onGo={vi.fn()} onOpenTheme={vi.fn()}/>);
    const many=renderToStaticMarkup(<TodayOverview date="2026-01-02" stats={{total:2,completed:1,percentage:50}} currentStreak={6} onGo={vi.fn()} onOpenTheme={vi.fn()}/>);
    for(const text of ['Total tasks','Completed','Completion rate','Journal streak','1 day'])expect(one).toContain(text);
    expect(one).not.toContain('1 days');expect(many).toContain('6 days');
    expect(many).toContain('role="progressbar"');expect(many).not.toContain('today.');
  });

  it('keeps the four-stat panel responsive with a two-by-two compact grid',()=>{
    const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
    expect(styles).toContain('.stats { grid-template-columns: repeat(2,minmax(0,1fr)); }');
    expect(styles).toContain('.stats .stat:nth-child(3) { border-left: 0; }');
    expect(styles).toContain('.stats .stat:nth-child(3),.stats .stat:nth-child(4) { border-top: 1px solid var(--stats-border); }');
  });
});
