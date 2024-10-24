import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";

const client = postgres(env.DATABASE_URL!);
export const db = drizzle(client);

export const deleteResource = async (id: string) => {
    console.log(`Attempting to delete resource with id: ${id}`);
    try {
        const result = await db.delete('resources').where({ id });
        console.log(`Delete result:`, result);
        if (result.count === 0) {
            throw new Error(`Resource with id ${id} not found.`);
        }
    } catch (error) {
        console.error("Error deleting resource:", error);
        throw error; // Re-throw the error after logging it
    }
};
