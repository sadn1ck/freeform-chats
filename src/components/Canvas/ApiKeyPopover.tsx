import { useState } from "react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";
import { models } from "../../utils/ai";
import { Button } from "../ui/button";
import { Popover } from "../ui/popover";

const ApiKeyPopover = () => {
  const snap = useSnapshot(tabsStore);
  const [apiKey, setApiKey] = useState(snap.apiKey || "");

  return (
    <Popover.Root open={true}>
      <Popover.Anchor className="absolute top-0 right-0"></Popover.Anchor>
      <Popover.Portal>
        <Popover.Content className="bg-gray-200 p-1 border border-gray-400 rounded-md">
          <div
            className="flex gap-2 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              tabsStore.apiKey = apiKey;
            }}
          >
            <label className="text-sm font-medium whitespace-nowrap">
              OpenAI API Key
            </label>
            <input
              name="apiKey"
              type="password"
              autoFocus={false}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-sm rounded-md border p-1 w-[160px]"
              placeholder="OpenAI API key"
              onPaste={(e) => e.stopPropagation()}
            />
            <Button
              size={"sm"}
              type="submit"
              disabled={snap.apiKey === apiKey}
              onClick={() => (tabsStore.apiKey = apiKey)}
            >
              Save
            </Button>
            <select
              value={snap.modelId}
              onChange={(e) => (tabsStore.modelId = e.target.value)}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <button
              className="text-sm text-white bg-red-500 px-2 py-1 rounded-md hover:bg-red-800"
              onClick={() => {
                if (confirm("Are you sure?")) {
                  localStorage.clear();
                  window.location.reload();
                } else {
                  alert("Aborted");
                }
              }}
            >
              Reset app
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { ApiKeyPopover };
