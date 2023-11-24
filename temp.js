import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs/promises";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

try {
  const text = await fs.readFile("knowledge/info.txt", "utf-8");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const output = await splitter.createDocuments([text]);

  const sbApiKey = process.env.SUPABASE_API_KEY;
  const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
  const openAIApiKey = process.env.OPENAI_API_KEY;

  const client = createClient(sbUrl, sbApiKey);

  let res = await SupabaseVectorStore.fromDocuments(
    output,
    new OpenAIEmbeddings({ openAIApiKey }),
    {
      client,
      tableName: "documents",
    }
  );
  console.log("Supabase", res);
} catch (error) {
  console.dir("This went wrong:", error);
}
