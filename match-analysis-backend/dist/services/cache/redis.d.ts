export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    clear(): Promise<boolean>;
}
export declare const createCacheService: () => CacheService;
declare const _default: CacheService;
export default _default;
//# sourceMappingURL=redis.d.ts.map