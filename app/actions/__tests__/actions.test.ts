import { describe, expect, test, vi, afterEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { refreshEntries, getIsClub } from '@/lib/actions';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('refreshEntries calls revalidatePath', async () => {
  await refreshEntries();
  expect(revalidatePath).toHaveBeenCalledWith('/wheel');
});

describe('getIsClub', () => {
  test('returns true in club mode', async () => {
    vi.stubEnv('GAME_MODE', 'club');
    await expect(getIsClub()).resolves.toBe(true);
  });

  test('returns false in professional mode', async () => {
    vi.stubEnv('GAME_MODE', 'professional');
    await expect(getIsClub()).resolves.toBe(false);
  });

  test('defaults to professional when GAME_MODE is unset', async () => {
    vi.stubEnv('GAME_MODE', '');
    await expect(getIsClub()).resolves.toBe(false);
  });
});
