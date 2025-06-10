"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const matchController_1 = __importDefault(require("../controllers/matchController"));
const router = (0, express_1.Router)();
const analysisRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: {
            message: 'Too many analysis requests, please try again later.',
            type: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later.',
            type: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(generalRateLimit);
router.get('/health', matchController_1.default.healthCheck);
router.post('/analyze', analysisRateLimit, matchController_1.default.analyzeMatch);
router.get('/team/:teamId/form', matchController_1.default.getTeamForm);
router.get('/head-to-head', matchController_1.default.getHeadToHead);
router.post('/predictions', analysisRateLimit, matchController_1.default.getPredictions);
router.get('/overview', matchController_1.default.getMatchOverview);
exports.default = router;
//# sourceMappingURL=matchRoutes.js.map