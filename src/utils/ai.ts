import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { subscribeKey } from "valtio/utils";
import { tabsStore } from "../store/tabs";
import { AsyncIterableStream, ItemType } from "../types";

export const models = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo-instruct"];

let openai = createOpenAI({
  apiKey: tabsStore.apiKey,
});

subscribeKey(tabsStore, "apiKey", (nextVal) => {
  openai = createOpenAI({
    apiKey: nextVal as string,
  });
  console.log("[dbg] apiKey changed to", nextVal);
});

export function constructPrompt(
  messages: { type: ItemType; content: string }[]
): CoreMessage[] {
  return messages.map((message) => ({
    role: message.type,
    content: message.content,
  }));
}

export function streamPromptResponse(
  messages: CoreMessage[]
): AsyncIterableStream<string> {
  console.log(`[dbg] api call to ${tabsStore.modelId}`, messages);
  const stream = streamText({
    model: openai(tabsStore.modelId),
    messages,
  });

  return stream.textStream;
}
