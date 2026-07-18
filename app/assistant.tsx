"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AssistantRuntimeProvider,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ModelPicker } from "@/components/model-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_MODEL_ID, findChatModel } from "@/lib/models";

const MODEL_STORAGE_KEY = "chatpro:model";

export const Assistant = () => {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);

  // The transport reads the model id through a ref so switching models does
  // not recreate the transport (which would drop the ongoing conversation).
  const modelIdRef = useRef(modelId);
  modelIdRef.current = modelId;

  useEffect(() => {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored) setModelId(stored);
  }, []);

  const selectModel = (id: string) => {
    setModelId(id);
    localStorage.setItem(MODEL_STORAGE_KEY, id);
  };

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: () => ({ model: modelIdRef.current }),
      }),
    [],
  );

  const supportsImages = findChatModel(modelId)?.supportsImages ?? false;
  const attachments = useMemo(
    () =>
      new CompositeAttachmentAdapter([
        ...(supportsImages ? [new SimpleImageAttachmentAdapter()] : []),
        new SimpleTextAttachmentAdapter(),
      ]),
    [supportsImages],
  );

  const runtime = useChatRuntime({
    transport,
    adapters: { attachments },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="font-semibold">ChatPro</span>
            <ModelPicker
              value={modelId}
              onChange={selectModel}
              className="ml-auto"
            />
            <ThemeToggle />
          </header>
          <Thread />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
