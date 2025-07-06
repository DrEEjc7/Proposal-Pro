"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { useCallback, useRef } from "react"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; width?: number; height?: number }) => ReturnType
    }
  }
}

const ResizableImageComponent = (props: any) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const onResize = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return
      const startX = e.clientX
      const startWidth = containerRef.current.offsetWidth

      const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX)
        props.updateAttributes({ width: newWidth })
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [props],
  )

  return (
    <div
      ref={containerRef}
      className="resizable-image-container group relative my-4 inline-block"
      style={{ width: props.node.attrs.width }}
      data-drag-handle
    >
      <img {...props.node.attrs} className="block" />
      <div
        className="absolute -right-1 top-0 h-full w-2 cursor-col-resize bg-blue-500 opacity-0 group-hover:opacity-50"
        onMouseDown={onResize}
      />
    </div>
  )
}

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
      height: { default: "auto" },
    }
  },

  parseHTML() {
    return [{ tag: "img[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
