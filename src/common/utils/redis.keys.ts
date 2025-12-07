export class RedisKey {
  static hashedRefreshToken(
    userId: string,
    deviceId: string,
    refreshToken: string,
  ) {
    return `user:${userId}:refresh:${deviceId}:${refreshToken}`;
  }

  static patternOfUserHashedRefreshTokens(userId: string) {
    return `user:${userId}:refresh:*`;
  }

  static activeDays(userId: string, year: number) {
    return `user:${userId}:activeDays:${year}`;
  }

  static patternOfUserFields(userId: string) {
    return `user:${userId}:*`;
  }
}
