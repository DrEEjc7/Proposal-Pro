import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      insertColumns: () => ReturnType
    }
  }
}

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2}",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "columns", class: "columns" }), 0]
  },

  addCommands() {
    return {
      insertColumns:
        () =>
        ({ tr, dispatch, editor }) => {
          const { selection } = tr
          const node = this.type.create(null, [
            editor.schema.nodes.column.create(null, editor.schema.nodes.paragraph.create()),
            editor.schema.nodes.column.create(null, editor.schema.nodes.paragraph.create()),
          ])

          if (dispatch) {
            tr.replaceWith(selection.from, selection.to, node)
          }
          return true
        },
    }
  },
})

export const Column = Node.create({
  name: "column",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "column", class: "column" }), 0]
  },
})
