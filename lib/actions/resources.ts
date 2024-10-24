"use server";

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { generateEmbeddings } from "../ai/embedding";
import { db } from "../db";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";
import { eq } from 'drizzle-orm';

// Define types
export type Resource = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Embedding = {
  id: string;
  resourceId: string | null;
  content: string;
  embedding: number[];
};

export type ResourceWithEmbeddings = {
  resources: Resource;
  embeddings: Embedding | null;
};

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );
    return "Resource successfully created and embedded.";
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};

export const listResources = async (): Promise<ResourceWithEmbeddings[]> => {
  try {
    const resourcesList = await db
      .select({
        resources: resources,
        embeddings: embeddingsTable,
      })
      .from(resources)
      .leftJoin(embeddingsTable, eq(resources.id, embeddingsTable.resourceId));

    return resourcesList;
  } catch (error) {
    console.error("Error listing resources:", error);
    throw error;
  }
};

export const updateResource = async (id: string, content: string): Promise<string> => {
  try {
    // Update the resource
    await db.update(resources)
      .set({ content, updatedAt: new Date() })
      .where(eq(resources.id, id));

    // Delete old embeddings
    await db.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, id));

    // Generate and insert new embeddings
    const newEmbeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      newEmbeddings.map((embedding) => ({
        resourceId: id,
        ...embedding,
      })),
    );

    return "Resource successfully updated and re-embedded.";
  } catch (error) {
    console.error("Error updating resource:", error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error updating resource, please try again.";
  }
};

export const deleteResource = async (id: string): Promise<string> => {
  try {
    // Delete the resource (this will also delete associated embeddings due to CASCADE)
    await db.delete(resources).where(eq(resources.id, id));
    return "Resource successfully deleted.";
  } catch (error) {
    console.error("Error deleting resource:", error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error deleting resource, please try again.";
  }
};