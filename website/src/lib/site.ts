export const site = {
  name: 'LinenTag',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linentag.app').replace(/\/$/, ''),
  title: 'LinenTag | Smart NFC Sheet Identification',
  description:
    'Identify any sheet instantly with LinenTag. Smart washable NFC tags for bed sheets, pillowcases, hotels, Airbnb properties, and home organization.',
  tagline: 'Tap any sheet and instantly know exactly what it is.',
  keywords: [
    'smart sheets',
    'NFC sheets',
    'sheet identification',
    'linen management',
    'hotel linen tracking',
    'Airbnb bedding organization',
    'smart bedding',
    'linen inventory',
    'NFC tags for fabric',
    'sheet organizer',
  ],
  // Placeholders: replace with real addresses and profiles before launch.
  email: 'hello@linentag.app',
  social: {
    instagram: 'https://instagram.com/linentag',
    linkedin: 'https://www.linkedin.com/company/linentag',
    x: 'https://x.com/linentag',
  },
} as const;

export const mainNav = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/features', label: 'Features' },
  { href: '/nfc-tags', label: 'NFC tags' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
] as const;

export const footerNav = {
  Product: [
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/nfc-tags', label: 'NFC tags' },
    { href: '/labels', label: 'Label maker' },
    { href: '/pricing', label: 'Pricing (coming soon)' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
} as const;

export const USAGE_TYPES = [
  { value: 'home', label: 'My home' },
  { value: 'airbnb', label: 'Airbnb hosting' },
  { value: 'vacation_rental', label: 'Vacation rentals' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'laundry', label: 'Commercial laundry' },
  { value: 'care_home', label: 'Care home' },
  { value: 'manufacturer', label: 'Bedding manufacturer' },
  { value: 'other', label: 'Something else' },
] as const;
