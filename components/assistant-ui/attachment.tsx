"use client";

import { useEffect, useState, type FC } from "react";
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAttachment,
} from "@assistant-ui/react";
import { FileTextIcon, PaperclipIcon, XIcon } from "lucide-react";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

const useAttachmentSrc = () => {
  const file = useAttachment((a) =>
    a.type === "image" && a.status.type !== "complete" ? a.file : undefined,
  );
  const contentSrc = useAttachment((a) => {
    if (a.type !== "image") return undefined;
    const image = a.content?.find((part) => part.type === "image");
    return image?.image;
  });
  const [src, setSrc] = useState<string | undefined>(contentSrc);

  useEffect(() => {
    if (contentSrc) {
      setSrc(contentSrc);
      return;
    }
    if (!file) {
      setSrc(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, contentSrc]);

  return src;
};

const AttachmentThumbnail: FC = () => {
  const src = useAttachmentSrc();
  const name = useAttachment((a) => a.name);

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="bg-muted size-10 shrink-0 rounded-md object-cover"
    />
  ) : (
    <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
      <FileTextIcon className="size-4" />
    </div>
  );
};

const ComposerAttachment: FC = () => {
  return (
    <AttachmentPrimitive.Root className="bg-background relative flex max-w-48 items-center gap-2 rounded-lg border p-1.5 pr-2">
      <AttachmentThumbnail />
      <p className="text-muted-foreground truncate text-xs">
        <AttachmentPrimitive.Name />
      </p>
      <AttachmentPrimitive.Remove asChild>
        <TooltipIconButton
          tooltip="Remove attachment"
          side="top"
          className="bg-background text-muted-foreground absolute -right-2 -top-2 size-5 rounded-full border p-0.5"
        >
          <XIcon />
        </TooltipIconButton>
      </AttachmentPrimitive.Remove>
    </AttachmentPrimitive.Root>
  );
};

const UserMessageAttachment: FC = () => {
  const src = useAttachmentSrc();
  const name = useAttachment((a) => a.name);

  return (
    <AttachmentPrimitive.Root>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="max-h-40 max-w-48 rounded-lg border object-cover"
        />
      ) : (
        <div className="bg-muted flex max-w-48 items-center gap-2 rounded-lg border p-1.5 pr-2">
          <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
          <p className="text-muted-foreground truncate text-xs">
            <AttachmentPrimitive.Name />
          </p>
        </div>
      )}
    </AttachmentPrimitive.Root>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="flex w-full flex-row flex-wrap items-center gap-2 empty:hidden">
      <ComposerPrimitive.Attachments
        components={{ Attachment: ComposerAttachment }}
      />
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        tooltip="Add attachment"
        variant="ghost"
        className="my-2.5 size-8 p-2 transition-opacity ease-in"
      >
        <PaperclipIcon />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2 empty:hidden">
      <MessagePrimitive.Attachments
        components={{ Attachment: UserMessageAttachment }}
      />
    </div>
  );
};
