import { ComprehensiveMatchAnalysis, AnalysisRequest } from '../models/MatchAnalysis';
export declare class MatchAnalysisService {
    generateComprehensiveAnalysis(request: AnalysisRequest): Promise<ComprehensiveMatchAnalysis>;
    private fetchTeamAnalysisData;
    private fetchHeadToHeadData;
    private fetchLeagueContextData;
    private calculateExpectedStatistics;
    private validateAnalysisRequest;
    private generateCacheKey;
    private analyzeH2HMeetings;
    private analyzeTeamRecord;
    private processStandings;
    private getDefaultLeagueContext;
    private getEmptyH2HAnalysis;
    private assessDataQuality;
}
declare const _default: MatchAnalysisService;
export default _default;
//# sourceMappingURL=matchAnalysisService.d.ts.map