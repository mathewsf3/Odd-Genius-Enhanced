import { test, expect } from '@playwright/test';

test.describe('League Page', () => {
  test('should display leagues correctly', async ({ page }) => {
    await page.goto('/leagues');

    // Wait for leagues to load
    await page.waitForSelector('[data-testid="leagues-container"]');

    // Check if both sections are present
    const liveLeagues = page.locator('[data-testid="live-leagues"]');
    const upcomingLeagues = page.locator('[data-testid="upcoming-leagues"]');

    await expect(liveLeagues).toBeVisible();
    await expect(upcomingLeagues).toBeVisible();

    // Check if at least one league is displayed
    const leagueItems = page.locator('[data-testid="league-item"]');
    expect(await leagueItems.count()).toBeGreaterThan(0);
  });

  test('should handle error states', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/leagues', route => 
      route.fulfill({ status: 500 })
    );

    await page.goto('/leagues');

    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });
});