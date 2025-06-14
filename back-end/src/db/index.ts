import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import { recordsTable } from "./schema";
import { and, eq } from "drizzle-orm";
import { boolean } from "drizzle-orm/gel-core";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client });

export default db;

export const createRecord = async (
  userId: string,
  amount: number,
  title: string,
  date: Date
) => {
  // YYYY-MM-DD
  const dateObj = new Date(date);
  const amountInCents = amount * 100;

  try {
    const record = await db.insert(recordsTable).values({
      userId,
      amount: amountInCents,
      title,
      date: dateObj,
    });
    return record;
  } catch (error) {
    console.error("Error creating record:", error);
    return null;
  }
};

export const getRecords = async (userId: string, date: Date) => {
  const dateObj = new Date(date);
  try {
    const records = await db
      .select()
      .from(recordsTable)
      .where(
        and(eq(recordsTable.userId, userId), eq(recordsTable.date, dateObj))
      );
    records.forEach((record) => (record.amount = record.amount / 100));
    return records;
  } catch (error) {
    console.error("Error getting records:", error);
    return null;
  }
};
