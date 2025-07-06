"use client"

import { useRef } from "react"
import { Editor } from "@/components/editor"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Share, FileDown } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function ProposalGeneratorPage() {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleExportPdf = () => {
    const input = editorRef.current
    if (input) {
      // Temporarily remove the placeholder to not include it in the PDF
      const placeholder = input.querySelector(".ProseMirror-placeholder")
      if (placeholder) {
        ;(placeholder as HTMLElement).style.display = "none"
      }

      html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: null, // Use transparent background
      }).then((canvas) => {
        if (placeholder) {
          ;(placeholder as HTMLElement).style.display = "" // Restore placeholder
        }
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        })
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
        pdf.save("proposal.pdf")
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-950/80 dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50">Gorilla Docs</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The simplest way to create beautiful proposals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" onClick={handleExportPdf}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Editor editorRef={editorRef} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
