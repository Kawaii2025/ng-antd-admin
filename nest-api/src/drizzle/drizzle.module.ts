import { Module } from '@nestjs/common';
import { DrizzleAsyncProvider, PgPoolProvider, drizzleProvider } from './drizzle.provider';

@Module({
  providers: [...drizzleProvider],
  exports: [DrizzleAsyncProvider, PgPoolProvider],
})
export class DrizzleModule {}
