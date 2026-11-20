import { describe, expect, it } from 'vitest'
import { gmailComposeUrl, mailtoUrl, pickEmailHref } from '@/lib/contact'

const mail = {
  to: 'warrentabora3410@gmail.com',
  subject: 'Hello Warren, I found your portfolio',
}

const gmail =
  'https://mail.google.com/mail/?view=cm&fs=1&to=warrentabora3410%40gmail.com&su=Hello%20Warren%2C%20I%20found%20your%20portfolio'
const mailto = 'mailto:warrentabora3410@gmail.com?subject=Hello%20Warren%2C%20I%20found%20your%20portfolio'

describe('gmailComposeUrl', () => {
  it('opens a Gmail compose window with the address and the URL-encoded subject', () => {
    expect(gmailComposeUrl(mail)).toBe(gmail)
  })
})

describe('mailtoUrl', () => {
  it('builds a mailto link with the URL-encoded subject', () => {
    expect(mailtoUrl(mail)).toBe(mailto)
  })
})

describe('pickEmailHref', () => {
  it('uses mailto on a phone', () => {
    expect(pickEmailHref({ ...mail, isPhone: true })).toBe(mailto)
  })

  it('uses the Gmail compose link everywhere else', () => {
    expect(pickEmailHref({ ...mail, isPhone: false })).toBe(gmail)
  })
})
