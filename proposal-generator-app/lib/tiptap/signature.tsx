"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { PenSquare } from "lucide-react"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    signature: {
      insertSignature: () => ReturnType
    }
  }
}

export const SignatureComponent = (props: any) => {
  const { src } = props.node.attrs

  const onUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (readerEvent) => {
          const url = readerEvent.target?.result
          if (url) {
            props.updateAttributes({ src: url })
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div
      data-type="signature"
      className="signature-block my-4 inline-block border-2 border-dashed border-gray-300 p-2 dark:border-gray-700"
    >
      {src ? (
        <img src={src || "/placeholder.svg"} alt="Signature" className="h-16 w-auto" />
      ) : (
        <button
          onClick={onUpload}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <PenSquare className="h-5 w-5" />
          Click to add signature
        </button>
      )}
    </div>
  )
}

export const SignatureNode = Node.create({
  name: "signature",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signature"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "signature" })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SignatureComponent)
  },

  addCommands() {
    return {
      insertSignature:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },
})
