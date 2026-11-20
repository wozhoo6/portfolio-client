type Mail = { to: string; subject: string }

/** Opens a Gmail compose window with the address and subject filled in. */
export function gmailComposeUrl({ to, subject }: Mail): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`
}

/** Opens whatever mail app the visitor has set up. */
export function mailtoUrl({ to, subject }: Mail): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`
}

/** Phones use mailto (their mail app); everyone else gets the Gmail compose window. */
export function pickEmailHref({ to, subject, isPhone }: Mail & { isPhone: boolean }): string {
  return isPhone ? mailtoUrl({ to, subject }) : gmailComposeUrl({ to, subject })
}
