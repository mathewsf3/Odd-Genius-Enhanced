import { LeagueRepository } from '@/repositories/LeagueRepository';
import { prisma } from '@/lib/prisma';
import { mockLeagueData } from '../mocks/leagueData';

jest.mock('@/lib/prisma');

describe('LeagueRepository', () => {
  let repository: LeagueRepository;

  beforeEach(() => {
    repository = new LeagueRepository();
  });

  describe('findAll', () => {
    it('should return all leagues from database', async () => {
      (prisma.league.findMany as jest.Mock).mockResolvedValue(mockLeagueData);

      const result = await repository.findAll();
      expect(result).toEqual(mockLeagueData);
    });

    it('should handle database errors', async () => {
      (prisma.league.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(repository.findAll()).rejects.toThrow('Database connection failed');
    });
  });
});