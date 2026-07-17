export interface RateLimitOptions {
  //   Time window in seconds => 60 = one minute
  windowInSeconds: number;
  // maxRequests per window
  maxRequests: number;

  // optional prefix for redis key

  keyPrefix?: string;
}
