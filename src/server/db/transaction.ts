import { type SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { type ResultSet } from "@libsql/client";
import { type ExtractTablesWithRelations } from "drizzle-orm";
import { db } from ".";
import type * as schema from "./schema";
import { createContext } from "../utils/context";

export type Transaction = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type TxOrDb = Transaction | typeof db;

const TransactionContext = createContext<{
  tx: Transaction;
  effects: (() => void | Promise<void>)[];
}>();

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    return callback(db);
  }
}

export async function afterTx(effect: () => Promise<void> | void) {
  try {
    const { effects } = TransactionContext.use();
    effects.push(effect);
  } catch {
    await effect();
  }
}

export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    const effects: (() => void | Promise<void>)[] = [];
    const result = await db.transaction(async (tx) => {
      return TransactionContext.provide({ tx, effects }, () => callback(tx));
    });
    await Promise.all(effects.map((x) => x()));
    return result as T;
  }
}
