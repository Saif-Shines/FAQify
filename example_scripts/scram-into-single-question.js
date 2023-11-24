import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { retriever } from "../utils/retriever";
import { combineDocuments } from "../utils/combineDocuments";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";

const openAIApiKey = process.env.OPENAI_API_KEY;

const llm = new ChatOpenAI({ openAIApiKey });

const standaloneQuestionPrompt =
  PromptTemplate.fromTemplate(`Given a question, convert it into a standalone question.
question: {question} standalone question:`);

const answerPrompt = PromptTemplate.fromTemplate(`
You are an empathetic and friendly human doing support today. You try your best to find the answer in the given context, but if you are not able to you will politely suggest them to reach out support@scrimba.com. Ofcourse, don't make up the answer and always respond as if you're talking to a friend!
context: {context}
question: {question}
answer:
`);

// old
/**
 const chain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser())
  .pipe(retriever)
  .pipe(combineDocuments);
 */

// new
const StandaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionPrompt,
  llm,
  new StringOutputParser(),
]);

const contextChain = RunnableSequence.from([
  StandaloneQuestionChain,
  retriever,
  combineDocuments,
]);

const answerChain = RunnableSequence.from([
  answerPrompt,
  llm,
  new StringOutputParser(),
]);

const chain = RunnableSequence.from([
  {
    context: contextChain,
    question: StandaloneQuestionChain,
  },
  answerChain,
]);

const response = await chain.invoke({
  question:
    "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
});

console.info(response);
