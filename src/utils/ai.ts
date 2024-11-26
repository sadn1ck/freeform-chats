import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { subscribeKey } from "valtio/utils";
import { tabsStore } from "../store/tabs";
import { AsyncIterableStream, ItemType } from "../types";

let openai = createOpenAI({
  apiKey: "",
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
  const stream = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  return stream.textStream;
}
