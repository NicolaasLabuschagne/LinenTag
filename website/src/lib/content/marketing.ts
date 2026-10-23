import {
  BedDouble,
  Battery,
  Building2,
  ClipboardList,
  Droplets,
  Factory,
  Flame,
  HeartHandshake,
  Hotel,
  House,
  Layers,
  type LucideIcon,
  Palmtree,
  Repeat,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  WashingMachine,
} from 'lucide-react';

export type IconItem = { icon: LucideIcon; title: string; body: string };

export const steps: IconItem[] = [
  {
    icon: Sparkles,
    title: 'Attach LinenTag',
    body: 'New bedding can arrive with a tag already inside. For sheets you already own, sew a small washable NFC tag into a seam or hem in a minute.',
  },
  {
    icon: Smartphone,
    title: 'Tap with your phone',
    body: 'Hold your iPhone or Android phone to the folded sheet. No camera, no app hunting, no batteries in the tag.',
  },
  {
    icon: ScanLine,
    title: 'Instantly identify your sheets',
    body: 'See the size, set, room, material and wash history, plus every other piece that belongs with it.',
  },
];

export const features: IconItem[] = [
  {
    icon: ScanLine,
    title: 'Smart NFC identification',
    body: 'Every tagged item has its own identity. One tap shows exactly what it is, even folded at the back of a shelf.',
  },
  {
    icon: Layers,
    title: 'Bedding set matching',
    body: 'Scan any piece and see the whole set: fitted sheet, flat sheet, duvet cover and pillowcases, with what is missing.',
  },
  {
    icon: WashingMachine,
    title: 'Laundry tracking',
    body: 'Count washes automatically while you put laundry away, and know which set is on the bed, in the wash, or back in the closet.',
  },
  {
    icon: ClipboardList,
    title: 'Inventory management',
    body: 'Browse everything by room, set, size or storage place. Search for "guest king" and find it in a second.',
  },
  {
    icon: Hotel,
    title: 'Hotel & Airbnb support',
    body: 'Keep every property and room organised, give cleaners a fast way to make up the right bed, and spot missing pieces early.',
  },
  {
    icon: ShieldCheck,
    title: 'Made for the wash',
    body: 'Sealed, heat-resistant capsules designed to go through washing machines and dryers along with the fabric they are sewn into.',
  },
];

export const problems = [
  { title: 'Unidentified folded sheets', body: 'Is this the queen or the king? You only find out after unfolding it on the wrong bed.' },
  { title: 'Mixed-up bedding sets', body: 'Pillowcases drift between sets until nothing matches and nobody knows which goes with what.' },
  { title: 'Multiple mattress sizes', body: 'Twin, full, queen, king: the differences are inches, and folded sheets all look the same.' },
  { title: 'Hotel inventory confusion', body: 'Thousands of items move between rooms, carts and laundries, and losses only show up at stocktake.' },
  { title: 'Airbnb turnover pressure', body: 'Cleaners have a short window between guests and no time to search a closet for the right set.' },
] as const;

export const audiences: IconItem[] = [
  { icon: House, title: 'Homeowners', body: 'A linen closet that sorts itself. Find the right set for every bed without unfolding a thing.' },
  { icon: Palmtree, title: 'Airbnb hosts', body: 'Faster turnovers, matched sets for every listing, and fewer pieces walking out the door.' },
  { icon: Hotel, title: 'Hotels', body: 'Room-level linen visibility and wash-cycle history to plan replacements before guests notice.' },
  { icon: Factory, title: 'Commercial laundries', body: 'Know whose linen is whose, and how many cycles each piece has been through.' },
  { icon: HeartHandshake, title: 'Care homes', body: "Keep each resident's bedding together and correctly sized, with a simple tap for every carer." },
  { icon: Building2, title: 'Vacation rentals', body: 'Manage linen across several properties from one app, with sets assigned to each home and room.' },
];

export const productDetails: IconItem[] = [
  { icon: Droplets, title: 'Washproof NFC capsule', body: 'The chip is sealed inside a durable capsule, protected from water and detergent.' },
  { icon: Flame, title: 'Heat resistant', body: 'High-temperature engineering plastic designed to cope with hot washes, tumble drying and ironing nearby.' },
  { icon: WashingMachine, title: 'Machine wash safe', body: 'Goes through the washing machine with the sheet. No need to remove it first.' },
  { icon: Smartphone, title: 'Works with iPhone and Android', body: 'Uses standard NFC, built into modern iPhone and Android phones.' },
  { icon: Battery, title: 'No battery required', body: 'The tag is powered by your phone during a tap, so there is nothing to charge or replace.' },
  { icon: Repeat, title: 'Built to last', body: 'No battery to wear out and no moving parts. Designed to last the life of the linen it is sewn into.' },
];

export const benefits: IconItem[] = [
  { icon: Timer, title: 'Save time', body: 'Stop unfolding sheets to check their size. Make up the right bed on the first try.' },
  { icon: ShieldCheck, title: 'Reduce lost inventory', body: 'See which pieces of a set are missing while you put laundry away, not months later.' },
  { icon: WashingMachine, title: 'Simplify laundry management', body: 'Know which set is on the bed, which is in the wash, and where each one goes when it comes back.' },
  { icon: BedDouble, title: 'Improve organisation', body: 'Every set has a room, a colour and a home on the shelf, so everyone in the household can find it.' },
];

/**
 * EXAMPLE testimonials to show the layout. They are not from real customers: replace them with
 * real quotes (with permission) before launch, or set SHOW_TESTIMONIALS to false.
 */
export const SHOW_TESTIMONIALS = true;
export const testimonials = [
  {
    quote: 'Turnovers used to start with a hunt through the closet for the right queen set. Now the cleaner taps a sheet and knows.',
    role: 'Airbnb host, 3 listings',
  },
  {
    quote: 'With four kids and three bed sizes, the linen closet was chaos. Now each set has its own colour and its own shelf.',
    role: 'Parent of four',
  },
  {
    quote: 'Seeing how many washes each sheet has had makes replacement planning a decision instead of a guess.',
    role: 'Housekeeping manager, boutique hotel',
  },
] as const;
