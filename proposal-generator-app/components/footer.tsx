"use client"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-6">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © {currentYear} • Designed with ❤️ by{" "}
          <a
            href="https://dee7studio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-gray-900 dark:hover:text-gray-50"
          >
            Dee7 Studio
          </a>
        </p>
      </div>
    </footer>
  )
}
