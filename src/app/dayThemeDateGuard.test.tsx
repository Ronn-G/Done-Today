// @vitest-environment jsdom
import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActiveDayThemeDate } from './App';

afterEach(cleanup);

function DateGuardProbe({
  date,
  onRead,
}: {
  date: string;
  onRead: (value: string | null) => void;
}) {
  const activeDate = useActiveDayThemeDate(date);
  return (
    <button type="button" onClick={() => onRead(activeDate.current)}>
      Read active date
    </button>
  );
}

describe('Day Theme date guard', () => {
  it('restores the active date after the development StrictMode effect replay', () => {
    const onRead = vi.fn();
    render(
      <StrictMode>
        <DateGuardProbe date="2026-07-29" onRead={onRead} />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Read active date' }));
    expect(onRead).toHaveBeenCalledWith('2026-07-29');
  });
});
