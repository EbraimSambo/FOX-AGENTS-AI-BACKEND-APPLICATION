import { Injectable} from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../schemas/index.schema';
import { DatabaseService } from '../../../domain/core/db';

@Injectable()
export class DatabaseServiceImpl implements DatabaseService{
  private _db: NodePgDatabase<typeof schema>;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
      ssl: { rejectUnauthorized: false },
    });
    this._db = drizzle(pool, { schema, logger: true }) as NodePgDatabase<typeof schema>;
  }

  get db(): NodePgDatabase<typeof schema> {
    return this._db;
  }
}
