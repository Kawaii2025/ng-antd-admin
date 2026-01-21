import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from '../../enum/config.enum';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { PgPoolProvider } from '../../drizzle/drizzle.provider';
import { Pool } from 'pg';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(PgPoolProvider) private pool: Pool,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // jwt -> sign ->payload校
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigEnum.SECRET),
    });
  }

  // 在jwt策略下，passport首先验证jwt的签名并解码json,然后调用validate方法，该方法将解码后的json作为其单个参数传递。根据jwt签名的工作方式，我们可以保证接收到之前已经签名并发送给有效用户的有效token令牌
  async validate(payload: any) {
    // Load user permissions and cache them
    await this.loadUserPermissions(payload.sub);
    return { userId: payload.sub, username: payload.userName };
  }

  private async loadUserPermissions(userId: number) {
    try {
      const cacheKey = ConfigEnum.AUTH_CODE;
      
      // Check if already cached
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return;
      }

      // Query database for user permissions
      const client = await this.pool.connect();

      try {
        const result = await client.query(
          `SELECT DISTINCT srp.perm_code
           FROM sys_user_role sur
           JOIN sys_role_perm srp ON sur.role_id = srp.role_id
           WHERE sur.user_id = $1 AND srp.deleted_at IS NULL`,
          [userId],
        );

        const permissions = result.rows.map((row) => row.perm_code);
        
        // Cache permissions for 24 hours
        await this.cacheManager.set(cacheKey, permissions, 86400000);
        
        console.log(
          `[JWT] Loaded ${permissions.length} permissions for user ${userId}`,
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[JWT] Error loading permissions:', error);
      // Don't throw error - allow request to proceed
    }
  }
}
