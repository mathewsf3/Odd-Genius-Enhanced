import { render, screen, waitFor } from '@testing-library/react';
import { LeagueList } from '@/components/LeagueList';
import { getLeagues } from '@/api/leagues';
import { mockLeagueData } from '../mocks/leagueData';

// Mock the API module
jest.mock('@/api/leagues');

describe('LeagueList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    render(<LeagueList />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display leagues when API call is successful', async () => {
    (getLeagues as jest.Mock).mockResolvedValue(mockLeagueData);

    render(<LeagueList />);

    await waitFor(() => {
      mockLeagueData.forEach(league => {
        expect(screen.getByText(league.name)).toBeInTheDocument();
      });
    });
  });

  it('should display error message when API call fails', async () => {
    (getLeagues as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(<LeagueList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading leagues')).toBeInTheDocument();
    });
  });

  it('should correctly categorize live and upcoming leagues', async () => {
    (getLeagues as jest.Mock).mockResolvedValue(mockLeagueData);

    render(<LeagueList />);

    await waitFor(() => {
      expect(screen.getByTestId('live-leagues')).toBeInTheDocument();
      expect(screen.getByTestId('upcoming-leagues')).toBeInTheDocument();
    });
  });
});