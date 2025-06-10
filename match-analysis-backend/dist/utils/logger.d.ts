declare class Logger {
    private logger;
    constructor();
    info(message: string, meta?: any): void;
    error(message: string, error?: Error | any): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map