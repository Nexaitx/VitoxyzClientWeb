import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { data: any, timestamp: number, hits: number, ongoingRequest?: Observable<any> }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private cacheClearSubject = new Subject<string>();

  // Get cache with request deduplication
  get(key: string): Observable<any> | null {
    const cached = this.cache.get(key);
    
    if (cached) {
      // Return ongoing request if exists (deduplication)
      if (cached.ongoingRequest) {
        console.log('🔄 Returning ongoing request:', key);
        return cached.ongoingRequest;
      }
      
      // Return cached data if not expired
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        cached.hits++;
        this.cache.set(key, cached);
        console.log('📦 Serving from cache:', key, `(hits: ${cached.hits})`);
        return of(cached.data);
      }
      
      // Remove expired cache
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(),
      hits: 0 
    });
  }

  // Set ongoing request to prevent duplicate API calls
  setOngoingRequest(key: string, request: Observable<any>): void {
    const sharedRequest = request.pipe(shareReplay(1));
    
    this.cache.set(key, { 
      data: null, 
      timestamp: Date.now(),
      hits: 0,
      ongoingRequest: sharedRequest
    });
  }

  // Complete ongoing request and cache the result
  completeRequest(key: string, data: any): void {
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        hits: 0
      });
    }
  }

  // Clear ongoing request in case of error
  clearOngoingRequest(key: string): void {
    const cached = this.cache.get(key);
    if (cached && cached.ongoingRequest) {
      this.cache.delete(key);
    }
  }

  getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  clearKey(key: string): void {
    this.cache.delete(key);
    this.cacheClearSubject.next(key);
    console.log('🗑️ Cache cleared for key:', key);
  }

  clearPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheClearSubject.next(key);
    });
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for pattern: ${pattern}`);
  }

  clear(): void {
    const size = this.cache.size;
    const keys = Array.from(this.cache.keys());
    this.cache.clear();
    keys.forEach(key => this.cacheClearSubject.next(key));
    console.log(`🗑️ Cleared all cache (${size} entries)`);
  }

  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Listen for cache clear events
  onCacheClear(): Observable<string> {
    return this.cacheClearSubject.asObservable();
  }

  cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }
}
