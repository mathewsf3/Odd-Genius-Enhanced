export interface Config {
    server: {
        port: number;
        host: string;
        env: string;
    };
    api: {
        footystats: {
            key: string;
            baseUrl: string;
            rateLimit: {
                requestsPerMinute: number;
                requestsPerDay: number;
            };
        };
    };
    cache: {
        redis: {
            url?: string;
            host: string;
            port: number;
            password?: string;
            db: number;
        };
        memory: {
            maxSize: number;
            ttl: number;
        };
    };
    logging: {
        level: string;
        file: boolean;
        console: boolean;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=config.d.ts.map