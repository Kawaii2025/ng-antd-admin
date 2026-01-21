import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';
export const PgPoolProvider = 'PgPoolProvider';

export const drizzleProvider = [
  {
    provide: PgPoolProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');
      const pool = new Pool({
        connectionString,
      });
      return pool;
    },
  },
  {
    provide: DrizzleAsyncProvider,
    inject: [PgPoolProvider],
    useFactory: async (pool: Pool) => {
      // 所有驼峰都改为下划线别名
      return drizzle({
        client: pool,
        logger: true,
        schema,
        casing: 'snake_case',
      }) as NodePgDatabase<typeof schema>;
    },
  },
];
