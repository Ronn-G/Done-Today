import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { WorkCategory } from '../domain/journal/categories';
import type { WorkItem, WorkStatus } from '../domain/journal/models';
import { initializeI18n } from '../i18n';
import {
  completeDeleteConfirmation,
  createJournalEligibilityTracker,
  DeleteConfirmationDialog,
  journalEligibilityChanged,
  requiresDeleteConfirmation,
  RowActionMenuContent,
  submitWorkStatusSelection,
  WorkRow,
} from './App';

const category: WorkCategory = {
  id: 'category-42',
  name: 'Khách hàng ACME',
  color: '#4F7CAC',
  position: 0,
  isActive: true,
  createdAt: '2026-07-24T00:00:00Z',
  updatedAt: '2026-07-24T00:00:00Z',
};
const item: WorkItem = {
  id: 'item-17',
  dailyLogId: 'log-1',
  categoryId: category.id,
  position: 0,
  status: 'postponed',
  task: 'Chuẩn bị bản demo',
  result: 'Khách đã xem ✓',
  nextAction: 'Follow up at 09:30',
  createdAt: '2026-07-24T00:00:00Z',
  updatedAt: '2026-07-24T00:00:00Z',
};
const renderRow = (onChange = vi.fn(), onCategoryChange = vi.fn()) =>
  renderToStaticMarkup(
    <table>
      <tbody>
        <WorkRow
          item={item}
          categories={[category]}
          dataIndex={0}
          autoFocus={false}
          onFocused={vi.fn()}
          onChange={onChange}
          onJournalActivityChanged={vi.fn()}
          onCategoryChange={onCategoryChange}
          onDelete={vi.fn()}
          onMoveUp={vi.fn()}
          onMoveDown={vi.fn()}
          canMoveUp
          canMoveDown
        />
      </tbody>
    </table>,
  );
const renderActions = () =>
  renderToStaticMarkup(
    <RowActionMenuContent
      item={item}
      categories={[category]}
      position={{ left: 10, top: 20 }}
      onMove={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
const renderDialog = () =>
  renderToStaticMarkup(
    <DeleteConfirmationDialog onCancel={vi.fn()} onConfirm={vi.fn()} />,
  );

describe('I18N-2 Today row editing, status and actions', () => {
  it('renders Vietnamese editors, stable status values, actions and confirmation copy', async () => {
    await initializeI18n('vi');
    const row = renderRow();
    const actions = renderActions();
    const dialog = renderDialog();
    for (const text of [
      'Việc đã làm',
      'Bạn đã làm gì?',
      'Kết quả',
      'Kết quả ra sao?',
      'Bước tiếp theo',
      'Tiếp theo cần làm gì?',
      'Hoàn thành',
      'Đang làm',
      'Bị hoãn',
      'Đã hủy',
    ])
      expect(row).toContain(text);
    for (const value of ['completed', 'in_progress', 'postponed', 'cancelled'])
      expect(row).toContain(`value="${value}"`);
    expect(row).toContain('aria-label="Di chuyển lên"');
    expect(row).toContain('aria-label="Di chuyển xuống"');
    expect(row).toContain(
      'aria-label="Hành động cho công việc Chuẩn bị bản demo"',
    );
    expect(actions).toContain('Chuyển sang nhóm');
    expect(actions).toContain('Khách hàng ACME');
    expect(actions).toContain('Việc khác');
    expect(actions).toContain('Xóa công việc');
    expect(dialog).toContain('Xóa công việc này?');
    expect(dialog).toContain('Nội dung đã nhập sẽ không thể khôi phục.');
    expect(dialog).toContain('>Hủy<');
    expect(dialog).toContain('>Xóa công việc<');
    expect(`${row}${actions}${dialog}`).not.toContain('today.');
  });

  it('switches the same row to English without translating or writing user data', async () => {
    const onChange = vi.fn();
    const onCategoryChange = vi.fn();
    await initializeI18n('vi');
    const vietnamese = renderRow(onChange, onCategoryChange);
    await initializeI18n('en');
    const english = renderRow(onChange, onCategoryChange);
    const actions = renderActions();
    const dialog = renderDialog();
    for (const text of [
      'Work done',
      'What did you work on?',
      'Result',
      'What was the result?',
      'Next step',
      'What needs to happen next?',
      'Completed',
      'In progress',
      'Postponed',
      'Cancelled',
    ])
      expect(english).toContain(text);
    expect(english).toContain('aria-label="Move up"');
    expect(english).toContain('aria-label="Move down"');
    expect(english).toContain(
      'aria-label="Actions for task Chuẩn bị bản demo"',
    );
    expect(actions).toContain('Move to category');
    expect(actions).toContain('Khách hàng ACME');
    expect(actions).toContain('Other');
    expect(actions).toContain('Delete task');
    expect(dialog).toContain('Delete this task?');
    expect(dialog).toContain('The content you entered can’t be recovered.');
    expect(dialog).toContain('>Cancel<');
    expect(dialog).toContain('>Delete task<');
    for (const value of [
      item.task,
      item.result,
      item.nextAction,
      category.name,
    ]) {
      expect(vietnamese + renderActions()).toContain(value);
      expect(english + actions).toContain(value);
    }
    expect(item).toMatchObject({
      id: 'item-17',
      status: 'postponed',
      categoryId: 'category-42',
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCategoryChange).not.toHaveBeenCalled();
    expect(`${english}${actions}${dialog}`).not.toContain('today.');
  });

  it('keeps status IDs and editor limits stable across localized labels', async () => {
    const selected: WorkStatus[] = [];
    expect(
      submitWorkStatusSelection('completed', (value) => selected.push(value)),
    ).toBe(true);
    expect(
      submitWorkStatusSelection('in_progress', (value) => selected.push(value)),
    ).toBe(true);
    expect(
      submitWorkStatusSelection('Đang làm', (value) => selected.push(value)),
    ).toBe(false);
    expect(
      submitWorkStatusSelection('Completed', (value) => selected.push(value)),
    ).toBe(false);
    expect(selected).toEqual(['completed', 'in_progress']);
    await initializeI18n('en');
    const html = renderRow();
    expect(html).toContain('maxLength="500"');
    expect(html).toContain('maxLength="2000"');
    expect(html).toContain('maxLength="1000"');
    expect(html).toContain('value="postponed" selected=""');
  });

  it('preserves delete confirmation behavior for content and empty rows', () => {
    expect(requiresDeleteConfirmation(item)).toBe(true);
    expect(
      requiresDeleteConfirmation({
        ...item,
        task: ' ',
        result: '',
        nextAction: '',
      }),
    ).toBe(false);
    const onDelete = vi.fn();
    expect(completeDeleteConfirmation(false, onDelete)).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();
    expect(completeDeleteConfirmation(true, onDelete)).toBe(true);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('refreshes streak eligibility only when persisted primary task content crosses empty/non-empty', () => {
    expect(journalEligibilityChanged('', 'Journal entry')).toBe(true);
    expect(journalEligibilityChanged('   ', '\t')).toBe(false);
    expect(journalEligibilityChanged('Journal entry', 'Edited entry')).toBe(
      false,
    );
    expect(journalEligibilityChanged('Journal entry', '   ')).toBe(true);
    const track = createJournalEligibilityTracker('');
    expect(track('Journal entry')).toBe(true);
    expect(track('Edited entry')).toBe(false);
    expect(track('')).toBe(true);
  });
});
