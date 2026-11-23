import { navLinks, site } from '@/data/content'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted md:flex-row md:justify-between">
        <p>
          © {site.copyrightYear} {site.name}
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="transition-colors hover:text-text">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
