"use client"

import type React from "react"
import { useEditor, EditorContent, type Range } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { useCompletion } from "ai/react"
import {
  Bold,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  ChevronDown,
  UnderlineIcon,
  Quote,
  Eraser,
  Pilcrow,
  ImagePlus,
  ColumnsIcon,
  PenSquare,
} from "lucide-react"
import { useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Custom Tiptap Extensions
import { Column } from "@/lib/tiptap/columns"
import { SignatureNode } from "@/lib/tiptap/signature"
import { ResizableImage } from "@/lib/tiptap/resizable-image"

const ToolbarButton = ({
  onClick,
  children,
  isActive = false,
  tooltip,
}: { onClick: () => void; children: React.ReactNode; isActive?: boolean; tooltip: string }) => (
  <Button
    variant="ghost"
    size="icon"
    className={cn("h-8 w-8 rounded-md", { "bg-gray-200 dark:bg-gray-700": isActive })}
    onClick={onClick}
    title={tooltip}
  >
    {children}
  </Button>
)

export function Editor({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) {
  const lastCompletion = useRef("")
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai",
    onFinish: (_prompt, completion) => {
      lastCompletion.current = completion
    },
    onError: (err) => {
      console.error(err)
      alert("An error occurred with the AI service.")
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
        columns: false,
        // Disable the default image extension
        image: false,
      }),
      Placeholder.configure({ placeholder: "Start writing your amazing proposal here..." }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Column,
      SignatureNode,
      ResizableImage,
    ],
    content: ``,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none",
      },
    },
  })

  const selectionRange = useRef<Range | null>(null)

  useEffect(() => {
    if (!completion || !editor) return

    const diff = completion.slice(lastCompletion.current.length)
    lastCompletion.current = completion

    if (selectionRange.current) {
      editor.chain().focus().insertContentAt(selectionRange.current, diff).run()
    }
  }, [completion, editor])

  const handleAiAction = (
    action: "improve" | "tone" | "format" | "generate",
    options?: { tone?: string; topic?: string },
  ) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")

    if (action === "generate") {
      const topic = window.prompt("What should the AI write about?")
      if (!topic) return
      selectionRange.current = { from, to }
      complete(topic, { body: { action: "generate" } })
      return
    }

    if (!text) {
      alert("Please select some text to apply an AI action.")
      return
    }

    const body: any = { action }
    if (action === "tone") {
      const tone = window.prompt("What tone should the text have? (e.g., professional, casual, witty)")
      if (!tone) return
      body.tone = tone
    }

    selectionRange.current = { from, to }
    complete(text, { body })
  }

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (readerEvent) => {
          const url = readerEvent.target?.result
          if (url && editor) {
            editor
              .chain()
              .focus()
              .setResizableImage({ src: url as string })
              .run()
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [editor])

  return (
    <div className="relative mx-auto w-full max-w-4xl rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 border-b bg-white/80 p-2 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        {/* Toolbar buttons remain the same as previous step */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2" title="Text Styles">
              <Heading1 className="h-4 w-4" />
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="mr-2 h-4 w-4" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="mr-2 h-4 w-4" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="mr-2 h-4 w-4" /> Subtitle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor?.chain().focus().setParagraph().run()}>
              <Pilcrow className="mr-2 h-4 w-4" /> Body
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
          tooltip="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
          tooltip="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive("underline")}
          tooltip="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor?.isActive("link")} tooltip="Add Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
          tooltip="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive("blockquote")}
          tooltip="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <ToolbarButton onClick={addImage} tooltip="Add Image">
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().insertColumns().run()}
          isActive={editor?.isActive("columns")}
          tooltip="Add Columns"
        >
          <ColumnsIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().insertSignature().run()} tooltip="Add Signature">
          <PenSquare className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          tooltip="Remove Formatting"
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="AI Actions" disabled={isLoading}>
                <Sparkles
                  className={cn("h-4 w-4 text-purple-500", {
                    "animate-spin": isLoading,
                  })}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAiAction("generate")}>Generate text...</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAiAction("improve")}>Improve writing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAiAction("tone")}>Change tone</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAiAction("format")}>Auto-format</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
