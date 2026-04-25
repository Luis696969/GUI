const SECTION_LINKS = [
  { href: '#simulation', label: 'Simulation' },
  { href: '#devices', label: 'Devices' },
  { href: '#reactions', label: 'Reactions' },
  { href: '#interfaces', label: 'Interfaces' },
  { href: '#validation', label: 'Validation' },
  { href: '#json-preview', label: 'JSON Preview' }
] as const;

export function SectionNav() {
  return (
    <nav className="section-nav editor-panel" aria-label="Section summary">
      <p className="section-nav__title">Jump to section</p>
      <ul className="section-nav__list">
        {SECTION_LINKS.map((link) => (
          <li key={link.href}>
            <a className="section-nav__link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
