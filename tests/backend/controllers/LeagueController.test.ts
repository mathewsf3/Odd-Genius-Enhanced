import { LeagueController } from '@/controllers/LeagueController';
import { LeagueRepository } from '@/repositories/LeagueRepository';
import { mockLeagueData } from '../mocks/leagueData';

jest.mock('@/repositories/LeagueRepository');

describe('LeagueController', () => {
  let controller: LeagueController;
  let repository: jest.Mocked<LeagueRepository>;

  beforeEach(() => {
    repository = new LeagueRepository() as jest.Mocked<LeagueRepository>;
    controller = new LeagueController(repository);
  });

  describe('getLeagues', () => {
    it('should return all leagues', async () => {
      repository.findAll.mockResolvedValue(mockLeagueData);

      const result = await controller.getLeagues();
      expect(result).toEqual(mockLeagueData);
    });

    it('should handle errors appropriately', async () => {
      repository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.getLeagues()).rejects.toThrow('Database error');
    });
  });
});