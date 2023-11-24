import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";

const openAIApiKey = process.env.OPENAI_API_KEY;

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
const sbClient = createClient(sbUrl, sbApiKey);

const FAQVectorStore = new SupabaseVectorStore(embeddings, {
  client: sbClient,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = FAQVectorStore.asRetriever();

export { retriever };
