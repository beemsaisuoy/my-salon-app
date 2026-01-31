-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to products table (using 768 dimensions for Gemini embeddings)
alter table products add column if not exists embedding vector(768);

-- Create a function to search for products by embedding similarity
create or replace function match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id text,
  name text,
  description text,
  price float,
  category text,
  "imageUrl" text,
  stock int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    products.id,
    products.name,
    products.description,
    products.price,
    products.category,
    products.image_url as "imageUrl",
    products.stock,
    1 - (products.embedding <=> query_embedding) as similarity
  from products
  where 1 - (products.embedding <=> query_embedding) > match_threshold
  order by products.embedding <=> query_embedding
  limit match_count;
end;
$$;
