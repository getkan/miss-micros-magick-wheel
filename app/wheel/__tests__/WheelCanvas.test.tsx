import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import WheelCanvas from '@/components/WheelCanvas';

test('renders WheelCanvas component', () => {
  render(<WheelCanvas entries={[]} isClub={false} />);
  const button = screen.getByRole('button', { name: /spin the wheel/i });
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});
