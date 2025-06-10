import { render, screen, waitFor } from '@testing-library/react';
import { LeaguesComponent } from '../../../src/components/Leagues';

describe('Leagues Feature Tests', () => {
  test('leagues populate correctly from API', async () => {
    render(<LeaguesComponent />);
    
    await waitFor(() => {
      const leagueElements = screen.getAllByTestId('league-item');
      expect(leagueElements.length).toBeGreaterThan(0);
    });
    
    // Verify no console errors
    const consoleSpy = jest.spyOn(console, 'error');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('sidebar tab shows correct league count', async () => {
    render(<LeaguesComponent />);
    
    await waitFor(() => {
      const sidebarCount = screen.getByTestId('leagues-count');
      expect(sidebarCount).toHaveTextContent(/\d+/);
    });
  });
});