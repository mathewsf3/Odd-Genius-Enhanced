import { Request, Response, NextFunction } from 'express';
export declare class MatchController {
    analyzeMatch: (req: Request, res: Response, next: NextFunction) => void;
    getTeamForm: (req: Request, res: Response, next: NextFunction) => void;
    getHeadToHead: (req: Request, res: Response, next: NextFunction) => void;
    getPredictions: (req: Request, res: Response, next: NextFunction) => void;
    getMatchOverview: (req: Request, res: Response, next: NextFunction) => void;
    healthCheck: (req: Request, res: Response, next: NextFunction) => void;
    private calculateTeamProbabilities;
    private calculateMatchProbabilities;
    private generateRecommendations;
}
declare const _default: MatchController;
export default _default;
//# sourceMappingURL=matchController.d.ts.map