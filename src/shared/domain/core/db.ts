import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from 'src/shared/infrastructure/schemas/index.schema';

export abstract class  DatabaseService {
   abstract readonly db: NodePgDatabase<typeof schema>;
}