import { sql, type SQL } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

import * as schema from "./database/schema";

const connection = {
  user: process.env.POSTGRES_USER ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  database: process.env.POSTGRES_DB ?? "blood_donation",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  port: Number(process.env.POSTGRES_PORT ?? 5433),
};

export const nodePg = new Pool(connection);
export const db = drizzle({ client: nodePg, schema });

type Queryable = Pick<NodePgDatabase<typeof schema>, "execute">;

function parameterized(query: string, params: unknown[] = []): SQL {
  const statement = sql.empty();
  const parts = query.split(/(\$\d+)/g);

  for (const part of parts) {
    const match = /^\$(\d+)$/.exec(part);

    if (!match) {
      statement.append(sql.raw(part));
      continue;
    }

    const paramIndex = Number(match[1]) - 1;
    statement.append(sql`${params[paramIndex]}`);
  }

  return statement;
}

function createQueryApi(queryable: Queryable) {
  return {
    async query<T extends QueryResultRow = QueryResultRow>(
      query: string,
      params: unknown[] = [],
    ): Promise<QueryResult<T>> {
      return (await queryable.execute(parameterized(query, params))) as QueryResult<T>;
    },
  };
}

export const pg = {
  ...createQueryApi(db),
  transaction<T>(callback: (tx: ReturnType<typeof createQueryApi>) => Promise<T>) {
    return db.transaction((tx) => callback(createQueryApi(tx)));
  },
  end() {
    return nodePg.end();
  },
};

export default pg;
