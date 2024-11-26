import { useState } from "react";
import { useSnapshot } from "valtio";
import { tabsStore } from "../../store/tabs";
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
          <form
            className="flex gap-2 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              tabsStore.apiKey = apiKey;
            }}
          >
            <label className="text-sm font-medium whitespace-nowrap">
              API Key
            </label>
            <input
              name="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-sm rounded-md border p-1 w-[160px]"
              placeholder="OpenAI API key"
              onPaste={(e) => e.stopPropagation()}
            />
            <Button
              size={"sm"}
              type="submit"
              disabled={tabsStore.apiKey === apiKey}
            >
              Save
            </Button>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { ApiKeyPopover };
