import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { StringOutputParser } from "langchain/schema/output_parser";

const openAIApiKey = process.env.OPENAI_API_KEY;
const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;

const llm = new ChatOpenAI({ openAIApiKey });
const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const sbClient = createClient(sbUrl, sbApiKey);

const FAQVectorStore = new SupabaseVectorStore(embeddings, {
  client: sbClient,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = FAQVectorStore.asRetriever();

const standaloneQuestionTemplate = `Given a question, convert it into a standalone question.
question: {question} standalone question:
`;

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);
const chain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser())
  .pipe(retriever);

const relavantFAQResponse = await chain.invoke({
  question:
    "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
});

console.info(relavantFAQResponse);
