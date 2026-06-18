import OpenAI from "openai";
import { prisma } from "./db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Initialize the vector extension and create the entity_embeddings table.
 */
export async function initVectorDb() {
  try {
    // 1. Enable pgvector extension
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // 2. Create the entity_embeddings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS entity_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_id VARCHAR(255) UNIQUE NOT NULL,
        account_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        embedding vector(1536) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Create HNSW index for fast search
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS entity_embeddings_embedding_idx 
      ON entity_embeddings USING hnsw (embedding vector_cosine_ops);
    `);

    console.log("Vector database initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize vector database:", error);
    throw error;
  }
}

/**
 * Generate a 1536-dimension vector embedding for a given text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g, " "),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI Embedding generation failed:", error);
    throw error;
  }
}

/**
 * Upsert a vector embedding for a given cached entity.
 */
export async function upsertEntityEmbedding(
  entityId: string,
  accountId: string,
  entityType: string,
  text: string
) {
  try {
    const embedding = await generateEmbedding(text);
    const vectorStr = `[${embedding.join(",")}]`;

    // Try update first
    const updateResult = await prisma.$executeRawUnsafe(
      `
      UPDATE entity_embeddings 
      SET text = $1, embedding = $2::vector, updated_at = NOW()
      WHERE entity_id = $3
      `,
      text,
      vectorStr,
      entityId
    );

    if (updateResult === 0) {
      // If not updated, insert
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO entity_embeddings (entity_id, account_id, entity_type, text, embedding)
        VALUES ($1, $2, $3, $4, $5::vector)
        ON CONFLICT (entity_id) DO UPDATE 
        SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, updated_at = NOW();
        `,
        entityId,
        accountId,
        entityType,
        text,
        vectorStr
      );
    }
  } catch (error) {
    console.error(`Failed to upsert embedding for entity ${entityId}:`, error);
  }
}

export interface VectorSearchResult {
  entityId: string;
  entityType: string;
  distance: number;
  data: any;
}

/**
 * Performs local vector similarity search across emails and calendar events.
 */
export async function searchLocalEntities(
  tenantId: string,
  query: string,
  limit: number = 20
): Promise<VectorSearchResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const vectorStr = `[${embedding.join(",")}]`;

    // Query both embeddings and join with corsair_entities
    // to retrieve the full cached data.
    const results: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT 
        ee.entity_id as "entityId", 
        ee.entity_type as "entityType", 
        (ee.embedding <=> $1::vector) as distance,
        ce.data
      FROM entity_embeddings ee
      JOIN corsair_entities ce ON ce.id = ee.entity_id
      JOIN corsair_accounts ca ON ca.id = ce.account_id
      WHERE ca.tenant_id = $2
      ORDER BY distance ASC
      LIMIT $3;
      `,
      vectorStr,
      tenantId,
      limit
    );

    return results.map((r) => ({
      entityId: r.entityId,
      entityType: r.entityType,
      distance: Number(r.distance),
      data: r.data,
    }));
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}
