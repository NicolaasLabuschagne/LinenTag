export type Block = { type: 'p'; text: string } | { type: 'h2'; text: string } | { type: 'ul'; items: string[] };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  category: string;
  body: Block[];
};

const p = (text: string): Block => ({ type: 'p', text });
const h2 = (text: string): Block => ({ type: 'h2', text });
const ul = (...items: string[]): Block => ({ type: 'ul', items });

export const posts: Post[] = [
  {
    slug: 'why-identifying-sheets-is-harder-than-you-think',
    title: 'Why Identifying Sheets Is Harder Than You Think',
    description:
      'Folded sheets all look alike. Here is why telling a queen from a king is so frustrating, and what actually fixes it.',
    date: '2026-09-17',
    category: 'Home organization',
    body: [
      p('Open almost any linen closet and you will find the same thing: neat stacks of folded white rectangles that are impossible to tell apart. The problem is not that people are disorganized. It is that sheets are almost uniquely bad at identifying themselves.'),
      h2('The sizes are too close'),
      p('A queen flat sheet and a king flat sheet differ by a few inches in width. Folded into thirds and then in half, that difference disappears. Fitted sheets add another variable: pocket depth. Two fitted sheets for the same bed size can fit very differently depending on how deep the mattress is.'),
      h2('The labels are in the wrong place'),
      p('Manufacturers put the size label on one corner, often inside a seam, usually in tiny print, and frequently it fades or gets cut off after a few washes. To read it you have to unfold the sheet, find the right corner, and hope the label is still there.'),
      h2('Sets drift apart'),
      p('Even when every piece starts out matched, sets break up over time. A pillowcase goes into the wrong pile after laundry. A flat sheet gets used on a different bed. A few months later, nobody is sure which pieces belong together.'),
      h2('What people usually try'),
      ul(
        'Folding each set inside one of its own pillowcases. This works well, until the pillowcase is in the wash.',
        'Labelled shelves or bins. Helpful, but only if everyone in the house puts things back in the right place.',
        'Marking corners with laundry pens or coloured thread. Better, but still requires finding and reading the mark.',
      ),
      h2('A label that you can read without looking'),
      p('The underlying problem is that the identity of a sheet is written on the sheet itself, in a place that is hard to reach. An NFC tag sewn into the seam changes that. Your phone reads it through the fabric, so the folded sheet can stay folded. One tap shows the size, the set, the room and every other piece that belongs with it.'),
      p('That is the idea behind LinenTag: make every piece of bedding able to tell you what it is, instantly.'),
    ],
  },
  {
    slug: 'how-hotels-track-thousands-of-sheets',
    title: 'How Hotels Track Thousands of Sheets',
    description: 'From par levels to wash cycles: a look at how hotels manage linen at scale, and where technology helps.',
    date: '2026-09-24',
    category: 'Hospitality',
    body: [
      p('A hotel bed is turned over far more often than a bed at home, and every turnover moves linen between the room, the housekeeping cart, the laundry and storage. Multiply that by every room in the building and linen becomes one of the largest operational headaches in hospitality.'),
      h2('Par levels: the basic unit of hotel linen planning'),
      p('Hotels plan linen in "par": one complete set of linen for every bed. A property typically keeps several pars in circulation at once, so that one set can be on the bed, another in the laundry, and another clean on the shelf. Running short means beds cannot be made; running long ties up money in stock.'),
      h2('Where linen goes missing'),
      ul(
        'Items discarded because they are stained or damaged without being recorded.',
        'Pieces mixed into another property’s linen at a shared commercial laundry.',
        'Linen used for other purposes, from cleaning rags to pet bedding.',
        'Guests taking items home.',
      ),
      p('Without item-level tracking, losses usually only show up at a periodic stocktake, long after anything can be done about them.'),
      h2('Counting by hand does not scale'),
      p('Manual counts are slow and error-prone, and they tell you how many items you have, not where they are or how worn they are. That is why larger operations have moved to tagging linen so it can be identified individually.'),
      h2('Tags that live in the linen'),
      p('Textile tags are sewn into each item and survive industrial washing. Long-range tags allow a whole cart to be counted at once, while short-range NFC tags let any staff member identify a single item with a phone. Either way, the result is visibility: which items exist, where they are, and how many wash cycles they have been through.'),
      h2('Wash cycles predict replacement'),
      p('Every wash weakens fibres. Knowing the cycle count of each item lets housekeeping plan replacements before guests notice thin or greying sheets, and lets procurement compare how long different suppliers’ linens really last.'),
      p('LinenTag brings the same item-level visibility to smaller hotels, guesthouses and rentals, without needing dedicated scanning hardware: the phone in every staff member’s pocket is the reader.'),
    ],
  },
  {
    slug: 'smart-nfc-technology-for-home-organization',
    title: 'Smart NFC Technology for Home Organization',
    description: 'NFC is already in your phone and your bank card. Here is how the same technology can organize your linen closet.',
    date: '2026-10-01',
    category: 'Technology',
    body: [
      p('If you have paid with your phone or tapped a transit card, you have used NFC. Near Field Communication is a short-range wireless standard that lets two devices exchange a small amount of data when they are a few centimetres apart.'),
      h2('How an NFC tag works without a battery'),
      p('An NFC tag is a tiny chip connected to an antenna. It has no battery. When your phone comes close, it creates a small electromagnetic field that powers the chip just long enough for it to answer with its unique ID. Move the phone away and the tag goes back to sleep. Because nothing runs down, the tag does not need charging or replacing.'),
      h2('Why NFC suits fabric'),
      ul(
        'Short range is a feature: you identify exactly the item you are holding, not everything on the shelf.',
        'Radio waves pass through fabric, so a folded sheet can be read without unfolding it.',
        'The chip can be sealed inside a small capsule that protects it from water and heat.',
        'Every modern smartphone can read it, so no extra hardware is needed.',
      ),
      h2('From a tag to useful information'),
      p('The tag itself only carries an ID. The useful part is what the ID is linked to. In LinenTag, the ID points to the item in your home: its name, size, material, which set it belongs to, which room it is for, and how many times it has been washed. Change the details in the app and the tag never needs rewriting.'),
      h2('Organizing around moments, not menus'),
      p('The best home technology disappears into routines. With LinenTag the two moments that matter are putting laundry away and making a bed. Tap pieces as you fold them and the app shows which set each one belongs to and where it lives. Tap any sheet in the closet and you know exactly what it is.'),
      p('NFC has been quietly reliable in payments and access cards for years. Applied to linen, it turns a stack of identical folded sheets into an organized, searchable inventory.'),
    ],
  },
  {
    slug: 'the-future-of-smart-bedding',
    title: 'The Future of Smart Bedding',
    description: 'Tags sewn in at the factory, closets that know what is inside, and bedding that tells you when it is worn out.',
    date: '2026-10-08',
    category: 'Industry',
    body: [
      p('Smart home technology has reached the thermostat, the doorbell and the light switch. Bedding, one of the things we use every single day, has barely changed. That is starting to shift.'),
      h2('Identity built in at the factory'),
      p('Today, adding a tag to bedding means sewing one in yourself. Tomorrow, it will happen during manufacturing. A tag sewn into the seam at the factory, with its ID printed on the packaging label, means a new set can be registered in seconds: scan the pack and every piece is already known, grouped and ready.'),
      h2('Closets that know what is inside'),
      p('Once every piece has an identity, storage can become smarter too. Picture a shelf that shows which sets are complete, or a light that guides you to the right spot when a set comes back from the laundry. The tag stays passive and washable; the intelligence lives in the phone and the home.'),
      h2('Care and lifespan you can see'),
      p('Wash counts reveal how hard bedding is really used. Over time that makes it possible to say when a set is near the end of its life, to compare materials honestly, and to buy fewer, better sheets.'),
      h2('Shared linen, from homes to hotels'),
      p('The same tag that helps a family find the guest-room sheets can help a rental host manage several properties, or a care home keep each resident’s bedding together. The value grows with the number of items and people involved.'),
      p('LinenTag is building toward that future: bedding that identifies itself, sets that stay together, and linen closets that organize themselves.'),
    ],
  },
  {
    slug: 'airbnb-linen-management-best-practices',
    title: 'Airbnb Linen Management Best Practices',
    description: 'Practical habits for hosts: how many sets to keep, how to store them, and how to make turnovers faster.',
    date: '2026-10-15',
    category: 'Hosting',
    body: [
      p('For short-term rental hosts, linen is where guest experience and operations meet. Guests notice crisp, matching, correctly sized bedding immediately, and cleaners feel every minute spent searching for it.'),
      h2('Keep enough sets in rotation'),
      p('A common rule of thumb is three sets per bed: one on the bed, one in the laundry, and one clean and ready. With back-to-back bookings or an off-site laundry, a fourth set gives you a buffer. Fewer sets means rushed laundry; many more ties up money and storage.'),
      h2('Standardize where you can'),
      ul(
        'Use the same colour and style across a property so stray pieces still match.',
        'If beds are different sizes, make the sizes easy to tell apart, for example with a different colour per size.',
        'Buy sets from the same supplier and range so replacements match.',
      ),
      h2('Store linen as complete sets'),
      p('Store each set together, ideally labelled by room and bed size, so a cleaner can grab one bundle and make up a bed without checking every piece. Folding a set inside one of its own pillowcases keeps it together on the shelf.'),
      h2('Make turnovers predictable'),
      ul(
        'Give each room a dedicated set and storage spot.',
        'Check sets are complete when they come back from the wash, not when a guest is due.',
        'Track which sets are on beds, in the wash and in storage, especially across multiple properties.',
      ),
      h2('Plan replacements before guests notice'),
      p('Sheets wear out with washing. Tracking how many times each set has been washed lets you replace linen on a schedule, before thin or stained pieces show up in a review.'),
      p('LinenTag helps with each of these habits: tap any piece to see its room and size, check a set is complete while you fold, and see wash counts at a glance.'),
    ],
  },
];

export const getPost = (slug: string) => posts.find((post) => post.slug === slug);

/** "September 17, 2026". Noon UTC so the date doesn't shift in any timezone. */
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const readingTime = (post: Post) => {
  const words = post.body
    .map((b) => (b.type === 'ul' ? b.items.join(' ') : b.text))
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};
