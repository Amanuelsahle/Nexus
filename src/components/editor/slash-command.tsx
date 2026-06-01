"use client";

import { FloatingMenu, useCurrentEditor } from "@tiptap/react";
import {
  Check,
  Heading1,
  Heading2,
  Heading3,
  List,
  Code,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SlashCommand = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const items = [
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: List,
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Code Block",
      description: "Capture a code snippet",
      icon: Code,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Image",
      description: "Insert an image",
      icon: ImageIcon,
      command: () => {
        const url = window.prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
  ];

  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 0 }}>
      <div className="absolute z-50 w-72 bg-popover rounded-md border shadow-lg p-1">
        <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
          Basic blocks
        </div>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.command();
              editor
                .chain()
                .focus()
                .deleteRange({
                  from: editor.state.selection.from - 1,
                  to: editor.state.selection.to,
                })
                .run();
            }}
            className={cn(
              "flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer",
              "focus:bg-accent focus:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </FloatingMenu>
  );
};
