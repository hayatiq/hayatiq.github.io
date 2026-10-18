/* ==============================
       Product Data
       ============================== */
// Loaded before script.js (see index.html) so PRODUCTS is a global by the time
// script.js's render functions read it. Keep this file focused on product
// listing/content — rendering logic lives in script.js.
//
// `warns`/`storage` below use an honest "coming soon" placeholder rather than
// invented ingredient/usage copy where real content isn't ready yet — swap
// `images`/`ingredients`/`how`/`tips` in as real content becomes available; empty
// arrays there just skip that section on the detail page (see renderDetail() in
// script.js), nothing breaks.
const PLACEHOLDER_WARNS = ["Full ingredient list and usage guidance coming soon — message us on Facebook if you have questions before ordering."];
const PLACEHOLDER_STORAGE = ["Store in a cool, dry place, away from direct sunlight and out of children's reach."];

// Bangla versions (`bn` on each product, read by js/i18n.js). Each one mirrors its
// English field: same list order, same <b>/<i> tags, and for `how` the same
// "Tab Name: point one; point two;" shape with the same number of points.
const PLACEHOLDER_WARNS_BN = ["সম্পূর্ণ উপাদান তালিকা ও ব্যবহারের নিয়ম শীঘ্রই যোগ হবে — অর্ডারের আগে কোনো প্রশ্ন থাকলে ফেসবুকে মেসেজ করুন।"];
const PLACEHOLDER_STORAGE_BN = ["ঠান্ডা, শুকনো জায়গায় রাখুন — সরাসরি রোদ থেকে দূরে এবং শিশুদের নাগালের বাইরে।"];

// The three Magnesium Oil Sprays share their content.
const MAGNESIUM_BN = {
  name: "ম্যাগনেসিয়াম অয়েল স্প্রে",
  benefits: ["ঘুম ও প্রশান্তি", "পেশির টান ও ব্যথা", "স্ট্রেস ও দুশ্চিন্তা"],
  ingredients: ["ম্যাগনেসিয়াম ক্লোরাইড ব্রাইন", "ল্যাভেন্ডার এসেনশিয়াল অয়েল"],
  howToUseNote: "ব্যবহারের আগে ভালোভাবে ঝাঁকিয়ে নিন।",
  how: [
    "দৈনিক সাপ্লিমেন্ট: <b>কোথায়</b>: হাত, পা ও পেটে ছড়িয়ে দিন।; <b>কতটুকু</b>: মোট ১৫–২০ বার স্প্রে।; <b>কখন</b>: সকাল ও সন্ধ্যায় ভাগ করে।;",
    "পেশির টান ও ব্যথা:<b>কোথায়</b>: টান লাগা বা ব্যথার পেশিতে সরাসরি (পায়ের পেছনের পেশি, উরু, হাত)।; <b>কতটুকু</b>: ১০–১৫ বার স্প্রে।; <b>কখন</b>: টান লাগার সময়, ব্যায়ামের পরে বা সারাদিন দাঁড়িয়ে থাকার পর।; <b>বাড়তি টিপস</b>: দ্রুত আরামের জন্য ম্যাসাজ করে লাগান।;",
    "ঘুম ও প্রশান্তি:<b>কোথায়</b>: পায়ের তালু, ঘাড়ের পেছনে, কাঁধে।; <b>কতটুকু</b>: ৫–১০ বার স্প্রে।; <b>কখন</b>: ঘুমানোর ৩০ মিনিট আগে।; <b>বাড়তি টিপস</b>: আরও গভীর প্রশান্তির জন্য আলতো করে ত্বকে ম্যাসাজ করুন।;",
    "রেস্টলেস লেগস সিনড্রোম:<b>কোথায়</b>: পায়ের পেছনের পেশি, উরু।; <b>কতটুকু</b>: ১০–১৫ বার স্প্রে।; <b>কখন</b>: ঘুমানোর আগে।;",
    "হাড় ও জয়েন্টের যত্ন:<b>কোথায়</b>: হাঁটু, কনুই, কোমর, কবজি।; <b>কতটুকু</b>: ৮–১২ বার স্প্রে।; <b>কখন</b>: প্রতিদিন, সম্ভব হলে সন্ধ্যায়।;",
    "মাথাব্যথা ও মাইগ্রেন:<b>কোথায়</b>: কপালের দুই পাশে (হালকা করে), ঘাড়ের পেছনে, কাঁধে।; <b>কতটুকু</b>: ২–৩ বার স্প্রে।; <b>কখন</b>: মাথাব্যথা বা মাইগ্রেন শুরু হলেই।; <b>বাড়তি টিপস</b>: বাড়তি আরামের জন্য কুসুম গরম পানিতে ম্যাগনেসিয়াম অয়েল মিশিয়ে পা ভিজিয়ে রাখুন। কপালে লাগাতে আগে হাতে স্প্রে করে তারপর আলতো ঘষে নিন।;",
    "চুল ও মাথার ত্বকের যত্ন:<b>কোথায়</b>: চুল সরিয়ে সরাসরি মাথার ত্বকে স্প্রে করুন।; <b>কতটুকু</b>: ৫–৮ বার স্প্রে।; <b>কখন</b>: সপ্তাহে ২–৩ বার, গোসলের আগে।; <b>বাড়তি টিপস</b>: মাথার ত্বকে ম্যাসাজ করে ৩০ মিনিট রেখে ধুয়ে ফেলুন।;",
    "মাসিকের ব্যথা ও PMS:<b>কোথায়</b>: তলপেট, কোমর।; <b>কতটুকু</b>: ৮–১২ বার স্প্রে।; <b>কখন</b>: পেটব্যথা বা PMS-এর অস্বস্তির সময়।; <b>বাড়তি টিপস</b>: ত্বকে শুষে না যাওয়া পর্যন্ত আলতো করে ম্যাসাজ করুন।;",
    "এনার্জি ও ক্লান্তি দূর:<b>কোথায়</b>: হাত, পা, পেট।; <b>কতটুকু</b>: ৫–১০ বার স্প্রে।; <b>কখন</b>: সকালে বা দুপুরের ক্লান্তির সময়।; <b>বাড়তি টিপস</b>: সঙ্গে হালকা স্ট্রেচিং বা লম্বা শ্বাস নিন।;",
    "ডিওডোরেন্ট:<b>কোথায়</b>: বগলে (পরিষ্কার, শুকনো ত্বকে)।; <b>কতটুকু</b>: প্রতি বগলে ২–৪ বার স্প্রে।; <b>কখন</b>: দিনে একবার (সকালে), দরকার হলে আবার।; <b>বাড়তি টিপস</b>: পুরোপুরি শুষে নেওয়ার পর কাপড় পরুন।;",
    "স্ট্রেস ও দুশ্চিন্তা:<b>কোথায়</b>: বুকে, কাঁধে, কানের পেছনে (চোখের খুব কাছে নয়)।; <b>কতটুকু</b>: ৫–৮ বার স্প্রে।; <b>কখন</b>: স্ট্রেসের সময়, কাজের পরে বা মেডিটেশনের আগে।;",
    "ব্যায়ামের পর রিকভারি:<b>কোথায়</b>: যে পেশির ব্যায়াম হয়েছে সেখানে (পা, হাত, পিঠ)।; <b>কতটুকু</b>: ১০–১৫ বার স্প্রে।; <b>কখন</b>: ব্যায়ামের ঠিক পরে বা ঘুমানোর আগে।;",
  ],
  tips: [
    "পরিষ্কার ত্বকে লাগান, খেয়াল রাখুন যেন মরা চামড়া না থাকে।",
    "ভালো ফল পেতে নিয়মিত ব্যবহার করুন।",
    "হালকা ঝিনঝিন লাগা স্বাভাবিক, নিয়মিত ব্যবহারে কমে যায়।",
    "ঝিনঝিন কমাতে পানি মিশিয়ে নিতে পারেন।",
  ],
  warns: [
    "<b>আগে প্যাচ টেস্ট:</b>  প্রথমবার পুরোপুরি ব্যবহারের আগে অল্প জায়গায় (কবজির ভেতরের দিকে বা পায়ে) লাগিয়ে দেখে নিন।",
    "<b>শুধু বাহ্যিক ব্যবহারের জন্য:</b>  খাবেন না বা মুখে নেবেন না।",
    "<b>সংবেদনশীল জায়গা এড়িয়ে চলুন:</b>  চোখ, মুখ, কাটা-ছেঁড়া ত্বক বা সদ্য শেভ করা জায়গার কাছে স্প্রে করবেন না।",
    "<b>ত্বকের সংবেদনশীলতা:</b>  প্রথমবার ব্যবহারে হালকা ঝিনঝিন, চুলকানি বা গরম ভাব লাগা স্বাভাবিক। জ্বালা না কমলে ধুয়ে ফেলুন, তারপর পানি মিশিয়ে আবার লাগান।",
  ],
  storage: [
    "বোতল শক্ত করে বন্ধ রাখুন। ঠান্ডা, শুকনো জায়গায় রাখুন — সরাসরি রোদ ও তাপ থেকে দূরে, শিশুদের নাগালের বাইরে।",
    "তৈরির ৬ মাসের মধ্যে ব্যবহার করুন।",
  ],
};

const PRODUCTS = [
  // ---- Hair Care ----
  {
    id: "8",
    name: "Detox Shampoo Bar",
    subtitle: "Oily Scalp · 60g+",
    slug: "detox-shampoo-bar",
    price: 700,
    category: "Hair Care",
    images: ["./images/detox_shampoo_bar.webp"],
    short: "A detoxifying bar shampoo formulated for oily scalps.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "ডিটক্স শ্যাম্পু বার",
      subtitle: "তৈলাক্ত মাথার ত্বক · ৬০ গ্রাম+",
      short: "তৈলাক্ত মাথার ত্বকের জন্য তৈরি ডিটক্সিফাইং শ্যাম্পু বার।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    // Set to true to feature this product in the homepage "Top Selling Products" carousel.
    topSelling: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
    // "You may also like" on this product's page: product ids, shown first. Same-category
    // products and top sellers fill the rest (up to 4). Use [] to rely on those alone.
    related: ["9", "6", "4"],
    display_order: null,
  },
  {
    // Was "Coming Soon" — now live with a real price/category; same id/slug kept for
    // Messenger ref continuity. Badged "new" per README's New Arrival convention.
    id: "6",
    name: "Silkroot Shampoo Bar",
    subtitle: "Sensitive Scalp · 60g+",
    slug: "silkroot-shampoo-bar",
    price: 700,
    category: "Hair Care",
    images: ["./images/silkRoot_shampoo_bar.webp"],
    short: "A gentle bar shampoo formulated for sensitive scalps.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "সিল্করুট শ্যাম্পু বার",
      subtitle: "সংবেদনশীল মাথার ত্বক · ৬০ গ্রাম+",
      short: "সংবেদনশীল মাথার ত্বকের জন্য তৈরি কোমল শ্যাম্পু বার।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: "new",
    related: ["9", "8", "4"],
    display_order: null,
  },
  {
    // Renamed from "Conditioner Bar" to match the finalized product copy; slug updated
    // to match too (was "conditioner-bar") — any ManyChat automation trigger keyed to
    // the old ref (see README.MD) needs updating to this new slug, or it'll stop
    // auto-replying (the Messenger link itself still opens fine either way).
    id: "9",
    name: "Solid Conditioner Bar",
    subtitle: "All Hair Types · 60g+",
    slug: "solid-conditioner-bar",
    price: 750,
    category: "Hair Care",
    images: ["./images/conditioner_bar.webp"],
    short: "A concentrated, plastic-free conditioner bar with BTMS-50, shea butter & Pro-Vitamin B5 for soft, smooth, easy-to-detangle hair.",
    // Optional per-product SEO overrides — see setPageMeta() in script.js. Falls back
    // to `${name} — Hayatiq` / `short` / the site defaults when left unset.
    seoTitle: "Solid Conditioner Bar in Bangladesh | HAYATIQ Plastic-Free Hair Care",
    metaKeywords: "solid conditioner bar, conditioner bar Bangladesh, hair conditioner bar, plastic-free conditioner, conditioner bar, solid hair conditioner, natural hair care Bangladesh, plastic-free hair care, zero-waste hair care, travel conditioner bar, conditioner bar for curly hair, conditioner for dry hair, sustainable hair care, handmade conditioner bar",
    // Ordered to match the official ingredient declaration; descriptions are the brand's
    // own "What's Inside" copy. Germall Plus (the preservative) has no brand-provided
    // description, so it's listed without one rather than inventing one.
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Plastic-free", "Soft, smooth hair", "Easy to detangle"],
    ingredients: [
      "<b>BTMS-50</b> — the conditioning ingredient that gives the bar its beautiful slip; helps hair feel smoother, softer, and easier to comb through.",
      "<b>Cetyl Alcohol</b> — a fatty alcohol that helps give the bar its creamy texture and smooth glide; despite the name, it's not the type of alcohol that dries out hair.",
      "<b>Shea Butter</b> — a rich plant butter that helps give hair a soft, conditioned feel.",
      "<b>Sunflower Oil</b> — a lightweight botanical oil that adds softness and helps leave hair feeling smooth.",
      "<b>Stearic Acid</b> — helps give the conditioner bar its firmness and a rich, creamy feel when applied to wet hair.",
      "<b>D-Panthenol (Pro-Vitamin B5)</b> — a popular hair-care ingredient that helps hair feel soft, smooth, and conditioned.",
      "<b>Germall Plus</b> — preserves the bar.",
      "<b>Rosemary Essential Oil</b> &amp; <b>Lavender Essential Oil</b> — a fresh, herbal, soft floral scent that makes conditioning feel a little more enjoyable.",
    ],
    how: [
      "Everyday Conditioning: Rinse hair thoroughly after shampooing.; Wet the bar and gently glide it over the lengths and ends, focusing away from the scalp.; You can also rub the bar between wet hands first and massage the conditioner into your hair.; Leave on for 1–3 minutes, then rinse thoroughly.;",
      "Deep Conditioning Mask: Apply through the lengths and ends.; Leave on for 10 minutes or longer instead of the usual 1–3.; Rinse thoroughly.; A simple at-home mask for days your hair feels dry, rough, tangled or in need of extra softness.;",
      "How Much to Use: Fine or easily weighed-down hair may only need a few swipes through the ends.; Thick, curly, long or very dry hair may need a little more.; Start with less than you think you need — solid conditioner is concentrated, and you can always add more.;",
    ],
    tips: [
      "Focus application on the lengths and ends rather than the scalp for the best conditioning effect.",
      "There's no single \"right\" amount — start small, work it through your hair, and add more where it's needed.",
      "Suitable for straight, wavy, curly and textured hair.",
    ],
    warns: [
      "For external use only.",
      "Avoid contact with the eyes. If contact occurs, rinse thoroughly with clean water.",
      "If irritation, redness, itching, or discomfort occurs, discontinue use.",
      "Contains rosemary and lavender essential oils — if you have sensitive skin or a known sensitivity to essential oils or fragrance, we recommend a small patch test before regular use.",
      "Keep out of reach of children.",
    ],
    storage: [
      "Keep it somewhere cool and dry, away from direct sunlight and excessive heat.",
      "Let it dry completely between uses — a draining soap dish, wire rack, or conditioner-bar holder works well; avoid leaving it directly under the shower stream.",
      "The more water the bar continuously absorbs, the softer it gets and the faster it's used up — this matters even more in Bangladesh's warm, humid climate.",
      "For travel, let the bar dry completely before placing it in a tin or travel container.",
      "Shelf life: 24 months from the date of manufacture.",
      "Use it, rinse it, drain it, let it dry.",
    ],
    bn: {
      benefits: ["প্লাস্টিকমুক্ত", "নরম, মসৃণ চুল", "জট ছাড়ানো সহজ"],
      name: "সলিড কন্ডিশনার বার",
      subtitle: "সব ধরনের চুল · ৬০ গ্রাম+",
      short: "BTMS-50, শিয়া বাটার ও প্রো-ভিটামিন বি৫ দিয়ে তৈরি ঘন, প্লাস্টিকমুক্ত কন্ডিশনার বার — চুল হয় নরম, মসৃণ, আর জট ছাড়ানো সহজ।",
      ingredients: [
        "<b>BTMS-50</b> — কন্ডিশনিংয়ের মূল উপাদান, যার জন্য বারটি চুলে মসৃণভাবে চলে; চুল হয় আরও মসৃণ, নরম ও সহজে আঁচড়ানো যায়।",
        "<b>সেটাইল অ্যালকোহল</b> — একটি ফ্যাটি অ্যালকোহল, যা বারটিকে ক্রিমি ও মসৃণ করে; নামে অ্যালকোহল হলেও এটি চুল শুষ্ক করে না।",
        "<b>শিয়া বাটার</b> — উদ্ভিদ থেকে পাওয়া সমৃদ্ধ বাটার, যা চুলকে নরম ও কন্ডিশনড রাখতে সাহায্য করে।",
        "<b>সূর্যমুখী তেল</b> — হালকা উদ্ভিজ্জ তেল, যা চুলে কোমলতা আনে ও মসৃণ রাখতে সাহায্য করে।",
        "<b>স্টিয়ারিক অ্যাসিড</b> — বারটিকে শক্ত রাখে, আর ভেজা চুলে লাগালে ঘন ও ক্রিমি অনুভূতি দেয়।",
        "<b>ডি-প্যানথেনল (প্রো-ভিটামিন বি৫)</b> — চুলের যত্নে জনপ্রিয় উপাদান, যা চুলকে নরম, মসৃণ ও কন্ডিশনড রাখতে সাহায্য করে।",
        "<b>জার্মল প্লাস</b> — বারটিকে ভালো রাখে (প্রিজারভেটিভ)।",
        "<b>রোজমেরি এসেনশিয়াল অয়েল</b> ও <b>ল্যাভেন্ডার এসেনশিয়াল অয়েল</b> — সতেজ, ভেষজ ও হালকা ফুলের সুবাস, যা কন্ডিশনিংকে আরও উপভোগ্য করে।",
      ],
      how: [
        "প্রতিদিনের কন্ডিশনিং: শ্যাম্পুর পর চুল ভালোভাবে ধুয়ে নিন।; বারটি ভিজিয়ে চুলের মাঝ থেকে আগা পর্যন্ত আলতো করে বুলিয়ে দিন — মাথার ত্বকে নয়।; চাইলে আগে ভেজা হাতে বারটি ঘষে নিয়ে কন্ডিশনার চুলে ম্যাসাজ করে লাগাতে পারেন।; ১–৩ মিনিট রেখে ভালোভাবে ধুয়ে ফেলুন।;",
        "ডিপ কন্ডিশনিং মাস্ক: চুলের মাঝ থেকে আগা পর্যন্ত লাগান।; সাধারণ ১–৩ মিনিটের বদলে ১০ মিনিট বা তার বেশি রেখে দিন।; ভালোভাবে ধুয়ে ফেলুন।; যেদিন চুল শুষ্ক, রুক্ষ বা জট লাগা মনে হয়, কিংবা বাড়তি নরম করা দরকার — সেদিনের জন্য সহজ ঘরোয়া মাস্ক।;",
        "কতটুকু ব্যবহার করবেন: পাতলা বা সহজে নেতিয়ে পড়া চুলে আগায় কয়েকবার বুলালেই যথেষ্ট।; ঘন, কোঁকড়া, লম্বা বা খুব শুষ্ক চুলে একটু বেশি লাগতে পারে।; যতটা দরকার মনে হয় তার চেয়ে কম দিয়ে শুরু করুন — সলিড কন্ডিশনার ঘন, দরকার হলে পরে আরও নিতে পারবেন।;",
      ],
      tips: [
        "সবচেয়ে ভালো ফলের জন্য মাথার ত্বকে নয়, চুলের মাঝ থেকে আগায় লাগান।",
        "নির্দিষ্ট কোনো \"সঠিক\" পরিমাণ নেই — অল্প দিয়ে শুরু করুন, চুলে ছড়িয়ে দিন, যেখানে দরকার সেখানে আরও দিন।",
        "সোজা, ঢেউখেলানো, কোঁকড়া — সব ধরনের চুলে ব্যবহার করা যায়।",
      ],
      warns: [
        "শুধু বাহ্যিক ব্যবহারের জন্য।",
        "চোখে লাগাবেন না। লেগে গেলে পরিষ্কার পানি দিয়ে ভালোভাবে ধুয়ে ফেলুন।",
        "জ্বালা, লালচে ভাব, চুলকানি বা অস্বস্তি হলে ব্যবহার বন্ধ করুন।",
        "এতে রোজমেরি ও ল্যাভেন্ডার এসেনশিয়াল অয়েল আছে — ত্বক সংবেদনশীল হলে বা এসেনশিয়াল অয়েল বা সুগন্ধিতে সমস্যা থাকলে নিয়মিত ব্যবহারের আগে অল্প জায়গায় প্যাচ টেস্ট করে নিন।",
        "শিশুদের নাগালের বাইরে রাখুন।",
      ],
      storage: [
        "ঠান্ডা ও শুকনো জায়গায় রাখুন — সরাসরি রোদ ও অতিরিক্ত গরম থেকে দূরে।",
        "প্রতিবার ব্যবহারের পর পুরোপুরি শুকাতে দিন — পানি ঝরে যায় এমন সোপ ডিশ, তারের র‍্যাক বা বার হোল্ডার ভালো; সরাসরি শাওয়ারের পানির নিচে রেখে দেবেন না।",
        "বার যত বেশি পানি শুষবে, তত নরম হবে আর তত তাড়াতাড়ি ফুরাবে — বাংলাদেশের গরম, আর্দ্র আবহাওয়ায় এটা আরও বেশি খেয়াল রাখা দরকার।",
        "ভ্রমণে নেওয়ার আগে বারটি পুরোপুরি শুকিয়ে টিন বা ট্রাভেল কন্টেইনারে রাখুন।",
        "মেয়াদ: তৈরির তারিখ থেকে ২৪ মাস।",
        "ব্যবহার করুন, ধুয়ে নিন, পানি ঝরিয়ে শুকাতে দিন।",
      ],
    },
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
    related: ["8", "6", "4"],
    display_order: 1,
  },
  {
    // Was "Coming Soon" — now live with a real price/category; same id/slug kept for
    // Messenger ref continuity. Badged "new" per README's New Arrival convention.
    id: "4",
    name: "RoseMintClove Scalp Elixir",
    subtitle: "118ml",
    slug: "scalp-elixir",
    price: 550,
    category: "Hair Care",
    images: ["./images/rose_mint_clove_scalp_elixir.webp"],
    short: "A rose, mint & clove scalp elixir for hair and scalp care.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "রোজমিন্টক্লোভ স্ক্যাল্প এলিক্সির",
      subtitle: "১১৮ মিলি",
      short: "চুল ও মাথার ত্বকের যত্নে গোলাপ, পুদিনা ও লবঙ্গের স্ক্যাল্প এলিক্সির।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: "new",
    related: ["8", "6", "9"],
    display_order: null,
  },
  // ---- Magnesium Oil Spray ----
  {
    id: "1",
    name: "Magnesium Oil Spray",
    subtitle: "30% Concentration · 100ml",
    slug: "magnesium-oil",
    price: 360,
    category: "Magnesium Oil Spray",
    images: [
      "./images/hayatiq_magnesium_oil_30.webp",
      "./images/hayatiq_magnesium_oil_2.webp",
      "./images/hayatiq_magnesium_oil_3.webp",
    ],
    short: "Nature’s Calm in Every Spray",
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Sleep & Relaxation", "Muscle Cramps & Soreness", "Stress & Anxiety"],
    ingredients: ["Magnesium Chloride Brine", "Lavender Essential Oil"],
    // Shown once above the How to Use tabs regardless of which tab is active — spray
    // products only, see renderHowToUseTags() in script.js.
    howToUseNote: "Shake well before use.",
    how: [
      "Daily Supplement: <b>Where</b>: Spread across arms, legs, stomach.; <b>How much</b>: 15–20 sprays total.; <b>When</b>: Split between morning & evening.;",
      "Muscle Cramps & Soreness:<b>Where</b>: Directly on cramped or sore muscles (calves, thighs, arms).; <b>How much</b>: 10–15 sprays.; <b>When</b>: During cramps, after workouts, or long days standing.; <b>Extra Tip</b>: Massage in for faster relief.;",
      "Sleep & Relaxation:<b>Where</b>: Soles of feet, back of neck, shoulders.; <b>How much</b>: 5–10 sprays.; <b>When</b>: 30 minutes before bedtime.; <b>Extra Tip</b>: Massage gently into skin for deeper relaxation.;",
      "Restless Legs Syndrome:<b>Where</b>: Calves, thighs.; <b>How much</b>: 10–15 sprays.; <b>When</b>: Before bedtime.;",
      "Bone & Joint Health:<b>Where</b>: Knees, elbows, lower back, wrists.; <b>How much</b>: 8–12 sprays.; <b>When</b>: Daily, preferably evening.;",
      "Headaches & Migraines:<b>Where</b>: Temples (lightly), back of neck, shoulders.; <b>How much</b>: 2–3 sprays.; <b>When</b>: At onset of headache/migraine.; <b>Extra Tip</b>: Soak feet in warm water + magnesium oil for additional relief. Spray on hand then rub it to temple.;",
      "Hair & Scalp Health:<b>Where</b>: Spray directly onto scalp (part hair).; <b>How much</b>: 5–8 sprays.; <b>When</b>: 2–3 times per week, before shower.; <b>Extra Tip</b>: Massage scalp, leave for 30 minutes, then wash.;",
      "Cramps & PMS Relief:<b>Where</b>: Lower abdomen, lower back.; <b>How much</b>: 8–12 sprays.; <b>When</b>: During cramps or PMS discomfort.; <b>Extra Tip</b>: Massage gently until absorbed.;",
      "Energy Boost & Fatigue Relief:<b>Where</b>: Arms, legs, stomach.; <b>How much</b>: 5–10 sprays.; <b>When</b>: Morning or mid-day slump.; <b>Extra Tip</b>: Pair with light stretching or deep breathing.;",
      "Deodorant:<b>Where</b>: Underarms (on clean, dry skin).; <b>How much</b>: 2–4 sprays per armpit.; <b>When</b>: Once daily (morning), reapply if needed.; <b>Extra Tip</b>: Wear clothing after fully absorbed.;",
      "Stress & Anxiety:<b>Where</b>: Chest, shoulders, behind ears (not too close to eyes).; <b>How much</b>: 5–8 sprays.; <b>When</b>: During stress, after work, or before meditation.;",
      "Exercise Recovery:<b>Where</b>: On exercised muscles (legs, arms, back).; <b>How much</b>: 10–15 sprays.; <b>When</b>: Right after workout or before bed.;",
    ],
    tips: [
      "Apply on clean skin, make sure there are no dead skin",
      "Consistent application is recommended for effective results",
      "A mild tingling sensation is normal and fades with regular use",
      "May dilute with water to ease tingling",
    ],
    warns: [
      "<b>Patch test first:</b>  Always test on a small area (inner wrist/leg) before first full use.",
      "<b>For external use only:</b>  Do not ingest unless specifically formulated for oral use.",
      "<b>Avoid sensitive areas:</b>  Do not spray near eyes, mouth, broken skin, cuts, or freshly shaved skin.",
      "<b>Skin sensitivity:</b>  A mild tingling, itching, or warmth is normal for first-time users. If irritation persists, rinse off and dilute with water before reapplying."
    ],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // "Shop by Need" tags — drawn from this product's own `how` entries above (Sleep &
    // Relaxation, Muscle Cramps & Soreness, Stress & Anxiety), not invented. Powers the
    // homepage "Find the Right Product" tiles (see NEED_TILES). Leave [] if a product
    // doesn't clearly fit a listed need yet.
    bn: {
      ...MAGNESIUM_BN,
      subtitle: "৩০% ঘনত্ব · ১০০ মিলি",
      short: "প্রতিটি স্প্রেতে প্রকৃতির প্রশান্তি",
    },
    concerns: ["Better Sleep", "Muscle Recovery"],
    // Add real customer reviews here as they come in — see README.MD.
    reviews: [],
    // Set to true to feature this product in the homepage "Top Selling Products" carousel.
    topSelling: false,
    badge: null,
    related: ["11", "14", "2", "10"],
    display_order: 7,
  },
  {
    id: "2",
    name: "Magnesium Oil Spray",
    subtitle: "50% Concentration · 100ml",
    slug: "magnesium-oil-50-concentration",
    price: 500,
    category: "Magnesium Oil Spray",
    images: [
      "./images/hayatiq_magnesium_oil_50.webp",
      "./images/hayatiq_magnesium_oil_2.webp",
      "./images/hayatiq_magnesium_oil_3.webp",
    ],
    short: "Nature’s Calm in Every Spray",
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Sleep & Relaxation", "Muscle Cramps & Soreness", "Stress & Anxiety"],
    ingredients: ["Magnesium Chloride Brine", "Lavender Essential Oil"],
    howToUseNote: "Shake well before use.",
    how: [
      "Daily Supplement: <b>Where</b>: Spread across arms, legs, stomach.; <b>How much</b>: 15–20 sprays total.; <b>When</b>: Split between morning & evening.;",
      "Muscle Cramps & Soreness:<b>Where</b>: Directly on cramped or sore muscles (calves, thighs, arms).; <b>How much</b>: 10–15 sprays.; <b>When</b>: During cramps, after workouts, or long days standing.; <b>Extra Tip</b>: Massage in for faster relief.;",
      "Sleep & Relaxation:<b>Where</b>: Soles of feet, back of neck, shoulders.; <b>How much</b>: 5–10 sprays.; <b>When</b>: 30 minutes before bedtime.; <b>Extra Tip</b>: Massage gently into skin for deeper relaxation.;",
      "Restless Legs Syndrome:<b>Where</b>: Calves, thighs.; <b>How much</b>: 10–15 sprays.; <b>When</b>: Before bedtime.;",
      "Bone & Joint Health:<b>Where</b>: Knees, elbows, lower back, wrists.; <b>How much</b>: 8–12 sprays.; <b>When</b>: Daily, preferably evening.;",
      "Headaches & Migraines:<b>Where</b>: Temples (lightly), back of neck, shoulders.; <b>How much</b>: 2–3 sprays.; <b>When</b>: At onset of headache/migraine.; <b>Extra Tip</b>: Soak feet in warm water + magnesium oil for additional relief. Spray on hand then rub it to temple.;",
      "Hair & Scalp Health:<b>Where</b>: Spray directly onto scalp (part hair).; <b>How much</b>: 5–8 sprays.; <b>When</b>: 2–3 times per week, before shower.; <b>Extra Tip</b>: Massage scalp, leave for 30 minutes, then wash.;",
      "Cramps & PMS Relief:<b>Where</b>: Lower abdomen, lower back.; <b>How much</b>: 8–12 sprays.; <b>When</b>: During cramps or PMS discomfort.; <b>Extra Tip</b>: Massage gently until absorbed.;",
      "Energy Boost & Fatigue Relief:<b>Where</b>: Arms, legs, stomach.; <b>How much</b>: 5–10 sprays.; <b>When</b>: Morning or mid-day slump.; <b>Extra Tip</b>: Pair with light stretching or deep breathing.;",
      "Deodorant:<b>Where</b>: Underarms (on clean, dry skin).; <b>How much</b>: 2–4 sprays per armpit.; <b>When</b>: Once daily (morning), reapply if needed.; <b>Extra Tip</b>: Wear clothing after fully absorbed.;",
      "Stress & Anxiety:<b>Where</b>: Chest, shoulders, behind ears (not too close to eyes).; <b>How much</b>: 5–8 sprays.; <b>When</b>: During stress, after work, or before meditation.;",
      "Exercise Recovery:<b>Where</b>: On exercised muscles (legs, arms, back).; <b>How much</b>: 10–15 sprays.; <b>When</b>: Right after workout or before bed.;",
    ],
    tips: [
      "Apply on clean skin, make sure there are no dead skin",
      "Consistent application is recommended for effective results",
      "A mild tingling sensation is normal and fades with regular use",
      "May dilute with water to ease tingling",
    ],
    warns: [
      "<b>Patch test first:</b>  Always test on a small area (inner wrist/leg) before first full use.",
      "<b>For external use only:</b>  Do not ingest unless specifically formulated for oral use.",
      "<b>Avoid sensitive areas:</b>  Do not spray near eyes, mouth, broken skin, cuts, or freshly shaved skin.",
      "<b>Skin sensitivity:</b>  A mild tingling, itching, or warmth is normal for first-time users. If irritation persists, rinse off and dilute with water before reapplying."
    ],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    // See NEED_TILES — same usage guidance as the 30% variant above.
    bn: {
      ...MAGNESIUM_BN,
      subtitle: "৫০% ঘনত্ব · ১০০ মিলি",
      short: "প্রতিটি স্প্রেতে প্রকৃতির প্রশান্তি",
    },
    concerns: ["Better Sleep", "Muscle Recovery"],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["11", "14", "10", "1"],
    display_order: 6,
  },
  {
    id: "10",
    name: "Magnesium Oil Spray",
    subtitle: "2x Strength · 130ml",
    slug: "magnesium-oil-2x-strength",
    price: 850,
    category: "Magnesium Oil Spray",
    images: ["./images/hayatiq_magnesium_oil_2x.webp"],
    short: "Nature’s Calm in Every Spray — now in extra strength.",
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Sleep & Relaxation", "Muscle Cramps & Soreness", "Stress & Anxiety"],
    ingredients: ["Magnesium Chloride Brine", "Lavender Essential Oil"],
    howToUseNote: "Shake well before use.",
    // Same usage guidance as the 30%/50% variants (same formula, higher concentration)
    // — see NEED_TILES comment on the 50% variant above.
    how: [
      "Daily Supplement: <b>Where</b>: Spread across arms, legs, stomach.; <b>How much</b>: 15–20 sprays total.; <b>When</b>: Split between morning & evening.;",
      "Muscle Cramps & Soreness:<b>Where</b>: Directly on cramped or sore muscles (calves, thighs, arms).; <b>How much</b>: 10–15 sprays.; <b>When</b>: During cramps, after workouts, or long days standing.; <b>Extra Tip</b>: Massage in for faster relief.;",
      "Sleep & Relaxation:<b>Where</b>: Soles of feet, back of neck, shoulders.; <b>How much</b>: 5–10 sprays.; <b>When</b>: 30 minutes before bedtime.; <b>Extra Tip</b>: Massage gently into skin for deeper relaxation.;",
      "Restless Legs Syndrome:<b>Where</b>: Calves, thighs.; <b>How much</b>: 10–15 sprays.; <b>When</b>: Before bedtime.;",
      "Bone & Joint Health:<b>Where</b>: Knees, elbows, lower back, wrists.; <b>How much</b>: 8–12 sprays.; <b>When</b>: Daily, preferably evening.;",
      "Headaches & Migraines:<b>Where</b>: Temples (lightly), back of neck, shoulders.; <b>How much</b>: 2–3 sprays.; <b>When</b>: At onset of headache/migraine.; <b>Extra Tip</b>: Soak feet in warm water + magnesium oil for additional relief. Spray on hand then rub it to temple.;",
      "Hair & Scalp Health:<b>Where</b>: Spray directly onto scalp (part hair).; <b>How much</b>: 5–8 sprays.; <b>When</b>: 2–3 times per week, before shower.; <b>Extra Tip</b>: Massage scalp, leave for 30 minutes, then wash.;",
      "Cramps & PMS Relief:<b>Where</b>: Lower abdomen, lower back.; <b>How much</b>: 8–12 sprays.; <b>When</b>: During cramps or PMS discomfort.; <b>Extra Tip</b>: Massage gently until absorbed.;",
      "Energy Boost & Fatigue Relief:<b>Where</b>: Arms, legs, stomach.; <b>How much</b>: 5–10 sprays.; <b>When</b>: Morning or mid-day slump.; <b>Extra Tip</b>: Pair with light stretching or deep breathing.;",
      "Deodorant:<b>Where</b>: Underarms (on clean, dry skin).; <b>How much</b>: 2–4 sprays per armpit.; <b>When</b>: Once daily (morning), reapply if needed.; <b>Extra Tip</b>: Wear clothing after fully absorbed.;",
      "Stress & Anxiety:<b>Where</b>: Chest, shoulders, behind ears (not too close to eyes).; <b>How much</b>: 5–8 sprays.; <b>When</b>: During stress, after work, or before meditation.;",
      "Exercise Recovery:<b>Where</b>: On exercised muscles (legs, arms, back).; <b>How much</b>: 10–15 sprays.; <b>When</b>: Right after workout or before bed.;",
    ],
    tips: [
      "Apply on clean skin, make sure there are no dead skin",
      "Consistent application is recommended for effective results",
      "A mild tingling sensation is normal and fades with regular use",
      "May dilute with water to ease tingling",
    ],
    warns: [
      "<b>Patch test first:</b>  Always test on a small area (inner wrist/leg) before first full use.",
      "<b>For external use only:</b>  Do not ingest unless specifically formulated for oral use.",
      "<b>Avoid sensitive areas:</b>  Do not spray near eyes, mouth, broken skin, cuts, or freshly shaved skin.",
      "<b>Skin sensitivity:</b>  A mild tingling, itching, or warmth is normal for first-time users — being the strongest concentration, patch-testing matters even more here. If irritation persists, rinse off and dilute with water before reapplying."
    ],
    storage: [
      "Keep bottle tightly sealed. Store in a cool, dry placeaway from direct sunlight, heat, or children’s reach.",
      "Use within 6 months of manufacture."
    ],
    bn: {
      ...MAGNESIUM_BN,
      subtitle: "দ্বিগুণ শক্তি · ১৩০ মিলি",
      short: "প্রতিটি স্প্রেতে প্রকৃতির প্রশান্তি — এখন আরও বেশি শক্তিতে।",
      warns: [
        ...MAGNESIUM_BN.warns.slice(0, 3),
        "<b>ত্বকের সংবেদনশীলতা:</b>  প্রথমবার ব্যবহারে হালকা ঝিনঝিন, চুলকানি বা গরম ভাব লাগা স্বাভাবিক — এটি সবচেয়ে বেশি ঘনত্বের, তাই এখানে প্যাচ টেস্ট আরও জরুরি। জ্বালা না কমলে ধুয়ে ফেলুন, তারপর পানি মিশিয়ে আবার লাগান।",
      ],
    },
    concerns: ["Better Sleep", "Muscle Recovery"],
    reviews: [],
    topSelling: true,
    badge: "hot",
    related: ["11", "14", "2", "1"],
    display_order: 5,
  },
  // ---- Salves & Balms ----
  {
    id: "11",
    name: "Pain Relief Salve",
    subtitle: "70g",
    slug: "pain-relief-salve",
    price: 700,
    category: "Salves & Balms",
    images: ["./images/placeholder.webp"],
    short: "A topical salve for on-the-go pain relief.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    // Sourced from the product's own name/purpose, not invented usage guidance.
    bn: {
      name: "পেইন রিলিফ সালভ",
      subtitle: "৭০ গ্রাম",
      short: "যেকোনো সময়, যেকোনো জায়গায় ব্যথায় আরামের জন্য ত্বকে লাগানোর সালভ।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: ["Muscle Recovery"],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["1", "10", "14"],
    display_order: null,
  },
  // ---- Bath Bombs ----
  {
    id: "12",
    name: "Bath Bomb",
    subtitle: "Botanical + Scent of Your Choice · 100g",
    slug: "bath-bomb",
    price: 220,
    category: "Bath Bombs",
    images: ["./images/hayatiq_bath_bomb_1.webp", "./images/hayatiq_bath_bomb_2.webp", "./images/hayatiq_bath_bomb_3.webp"],
    short: "A botanical bath bomb in your choice of scent.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "বাথ বম্ব",
      subtitle: "ভেষজ + পছন্দের সুবাস · ১০০ গ্রাম",
      short: "আপনার পছন্দের সুবাসে ভেষজ বাথ বম্ব।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
      // Option choices (attribute labels like "Shape:" are in js/i18n.js).
      choices: {
        "Round": "গোল",
        "Square": "চারকোনা",
        "Lavender": "ল্যাভেন্ডার",
        "Sweet Orange": "মিষ্টি কমলা",
        "Vanilla": "ভ্যানিলা",
        "Lemon": "লেবু",
        "Rose": "গোলাপ",
        "Color": "রঙিন",
        "Botanical": "ভেষজ",
        "Single Color": "এক রঙের",
        "Double Color": "দুই রঙের",
        "Pink": "গোলাপি",
        "Blue": "নীল",
        "Neem": "নিম",
        "Turmeric": "হলুদ",
        "Beetroot": "বিটরুট",
        "Hibiscus": "জবা ফুল",
      },
    },
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
    related: ["13", "14"],
    display_order: 8,
    attributes: [
      {
        id: "shape",
        label: "Shape",
        choices: ["Round", "Square"],
      },
      {
        id: "scent",
        label: "Scent",
        choices: ["Lavender", "Sweet Orange", "Vanilla", "Lemon", "Rose"],
      },
      {
        id: "styleType",
        label: "Style",
        choices: ["Color", "Botanical"],
      },
      {
        id: "colorLayer",
        label: "Color Layer",
        showIf: { styleType: "Color" },
        choices: ["Single Color", "Double Color"],
      },
      {
        id: "color",
        label: "Color",
        showIf: { styleType: "Color" },
        choices: ["Pink", "Blue"],
      },
      {
        id: "botanical",
        label: "Botanical",
        showIf: { styleType: "Botanical" },
        choices: ["Neem", "Turmeric", "Beetroot", "Hibiscus"],
      },
    ],
    priceMatrix: {
      "styleType:Color | colorLayer:Double Color": 240,
    },
    defaultSelections: {
      shape: "Round",
      scent: "Lavender",
      styleType: "Color",
      colorLayer: "Single Color",
      color: "Pink",
      botanical: "Neem",
    },
  },
  {
    id: "13",
    name: "Bath Bomb Set of 3",
    slug: "bath-bomb-set-of-3",
    price: 600,
    category: "Bath Bombs",
    images: ["./images/hayatiq_bath_bomb_set_1.webp", "./images/hayatiq_bath_bomb_1.webp" ],
    short: "A set of 3 botanical bath bombs.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "বাথ বম্ব সেট (৩টি)",
      short: "৩টি ভেষজ বাথ বম্বের সেট।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["12", "14"],
    display_order: 9,
  },
  // ---- Footsoaks ----
  {
    id: "14",
    name: "Footsoak Pack of 3",
    subtitle: "Botanical + Scent of Your Choice · 60g each",
    slug: "footsoak-pack-of-3",
    price: 270,
    category: "Footsoaks",
    images: ["./images/hayatiq_footsoak.webp"],
    short: "A botanical foot soak, pack of 3.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "ফুটসোক প্যাক (৩টি)",
      subtitle: "ভেষজ + পছন্দের সুবাস · প্রতিটি ৬০ গ্রাম",
      short: "ভেষজ ফুটসোক, ৩টির প্যাক।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["12", "13", "1"],
    display_order: null,
  },
  // ---- Oral Care ----
  {
    // Slug updated to match the finalized product copy's suggested URL (was
    // "copper-tongue-scraper") — update any ManyChat automation trigger keyed to the
    // old ref (see README.MD) to this new slug.
    id: "15",
    name: "Copper Tongue Scraper",
    subtitle: "Type A",
    slug: "copper-tongue-scraper-type-a",
    price: 650,
    category: "Oral Care",
    images: ["./images/hayatiq_copper_tongue_scraper.webp"],
    short: "Shop HAYATIQ Type A Copper Tongue Scraper in Bangladesh. A reusable copper tongue cleaner designed to gently remove tongue buildup and leave your mouth feeling fresh and clean.",
    seoTitle: "Copper Tongue Scraper Bangladesh | Type A Tongue Cleaner | HAYATIQ",
    metaKeywords: "copper tongue scraper, copper tongue cleaner, tongue scraper Bangladesh, copper tongue scraper Bangladesh, tongue cleaner, reusable tongue scraper, oral care Bangladesh",
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Reusable copper", "Lasts up to 10 years", "Fresh, clean mouth"],
    ingredients: [],
    how: [
      "Daily Use: Use once a day, preferably in the morning.; Hold the scraper with both hands.; Place it gently toward the back of your tongue — only as far as feels comfortable.; Gently pull it forward toward the tip of your tongue.; Rinse the scraper and repeat a few times.; Rinse your mouth afterwards.;",
      "Cleaning &amp; Polishing: Rinse the scraper with clean water after every use and dry it thoroughly.; Copper naturally develops a darker or duller look over time — this is completely normal.; To refresh its shine, mix a small amount of lemon juice with a pinch of salt, apply it with a soft cloth, gently rub for a few seconds, then rinse and dry thoroughly.; Avoid bleach, harsh chemical cleaners and abrasive scrubbers, as these can damage the copper.;",
    ],
    tips: [
      "There's no need to press hard — gentle and consistent strokes work best.",
      "For everyday care, simply rinse, dry and store; polish with lemon and salt only when needed.",
      "Takes just a few seconds and pairs well with your regular brushing routine.",
      "With proper care, it can last up to 10 years — a reusable swap for years of disposable tongue cleaners.",
    ],
    warns: [
      "For personal oral use only.",
      "Do not press or scrape aggressively, as this may irritate or injure the tongue.",
      "Do not use on cuts, sores or irritated areas.",
      "Stop using if you experience persistent pain or irritation.",
      "Keep away from children.",
    ],
    storage: [
      "Keep your tongue scraper somewhere clean and dry.",
      "Allow it to dry completely before storing.",
      "Avoid leaving it in standing water or in a constantly damp environment.",
    ],
    bn: {
      benefits: ["বারবার ব্যবহারযোগ্য তামা", "১০ বছর পর্যন্ত টেকে", "সতেজ, পরিষ্কার মুখ"],
      name: "কপার টাং স্ক্র্যাপার",
      subtitle: "টাইপ A",
      short: "HAYATIQ টাইপ A কপার টাং স্ক্র্যাপার — বারবার ব্যবহার করা যায় এমন তামার জিভ পরিষ্কারক, যা আলতো করে জিভের ময়লার স্তর তুলে মুখকে রাখে সতেজ ও পরিষ্কার।",
      how: [
        "প্রতিদিনের ব্যবহার: দিনে একবার, সম্ভব হলে সকালে ব্যবহার করুন।; দুই হাতে স্ক্র্যাপারটি ধরুন।; জিভের পেছনের দিকে আলতো করে রাখুন — যতটুকু আরামদায়ক লাগে, ততটুকুই।; আলতো করে জিভের আগার দিকে টেনে আনুন।; স্ক্র্যাপার ধুয়ে কয়েকবার এভাবে করুন।; শেষে কুলি করে মুখ ধুয়ে নিন।;",
        "পরিষ্কার ও চকচকে রাখা: প্রতিবার ব্যবহারের পর পরিষ্কার পানিতে ধুয়ে ভালোভাবে শুকিয়ে নিন।; সময়ের সাথে তামা কালচে বা মলিন হয়ে যায় — এটা একদম স্বাভাবিক।; চকচকে করতে অল্প লেবুর রসে এক চিমটি লবণ মিশিয়ে নরম কাপড় দিয়ে কয়েক সেকেন্ড আলতো ঘষুন, তারপর ধুয়ে ভালোভাবে শুকিয়ে নিন।; ব্লিচ, কড়া কেমিক্যাল ক্লিনার বা খসখসে স্ক্রাবার ব্যবহার করবেন না — এতে তামা নষ্ট হতে পারে।;",
      ],
      tips: [
        "জোরে চাপ দেওয়ার দরকার নেই — আলতো ও নিয়মিত টানেই সবচেয়ে ভালো কাজ হয়।",
        "প্রতিদিনের যত্নে শুধু ধুয়ে, শুকিয়ে রেখে দিন; দরকার হলে তবেই লেবু-লবণ দিয়ে চকচকে করুন।",
        "মাত্র কয়েক সেকেন্ড লাগে, আর দাঁত ব্রাশের রুটিনের সাথে সহজেই মিলে যায়।",
        "ঠিকমতো যত্ন নিলে ১০ বছর পর্যন্ত টিকতে পারে — বছরের পর বছর একবার ব্যবহারের টাং ক্লিনারের বদলে একটিই যথেষ্ট।",
      ],
      warns: [
        "শুধু নিজের মুখের যত্নে ব্যবহারের জন্য।",
        "জোরে চাপ দেবেন না বা ঘষবেন না — জিভে জ্বালা বা আঘাত লাগতে পারে।",
        "জিভে কাটা, ঘা বা জ্বালা থাকলে সেখানে ব্যবহার করবেন না।",
        "ব্যথা বা জ্বালা না কমলে ব্যবহার বন্ধ করুন।",
        "শিশুদের থেকে দূরে রাখুন।",
      ],
      storage: [
        "টাং স্ক্র্যাপার পরিষ্কার ও শুকনো জায়গায় রাখুন।",
        "রেখে দেওয়ার আগে পুরোপুরি শুকিয়ে নিন।",
        "জমে থাকা পানিতে বা সবসময় ভেজা থাকে এমন জায়গায় রাখবেন না।",
      ],
    },
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
    related: ["16"],
    display_order: 4,
  },
  {
    // Renamed from "Biodegradable Floss" to match the finalized product copy; slug
    // updated too (was "biodegradable-floss-bottled") — update any ManyChat automation
    // trigger keyed to the old ref (see README.MD) to this new slug. Restructured to
    // variants since the copy prices Bottled and Refill separately (same pattern as
    // the Dish Soap Bar/Block product) — no separate product photo exists yet for the
    // Refill, so it reuses the Bottled product's images rather than inventing one.
    id: "16",
    name: "Biodegradable Dental Floss",
    slug: "biodegradable-dental-floss",
    category: "Oral Care",
    short: "Shop HAYATIQ biodegradable dental floss in Bangladesh. A simple, strong, and eco-conscious alternative to conventional plastic floss for everyday oral care.",
    seoTitle: "Biodegradable Dental Floss Bangladesh | Eco-Friendly Floss | HAYATIQ",
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Corn-based, biodegradable", "Reusable bottle", "Plastic-free alternative"],
    ingredients: [],
    how: [
      "Floss: Gently guide the floss between your teeth using a back-and-forth motion.; Curve it around each tooth and gently move it along the gumline.; Use a fresh section of floss for each space.; Be gentle — flossing shouldn't hurt.;",
    ],
    tips: [
      "Made from corn-based biodegradable material — a more thoughtful choice for everyday oral care.",
      "The bottle is reusable — once you run out, grab a Refill instead of buying the whole thing again.",
    ],
    warns: [
      "For dental use only. Do not swallow.",
      "Use gently to avoid irritating your gums.",
      "If you experience persistent bleeding, pain or discomfort, consult your dentist.",
    ],
    storage: [
      "Keep the bottle closed and store it somewhere clean and dry.",
      "Avoid exposing the floss to excess moisture.",
    ],
    bn: {
      benefits: ["ভুট্টা থেকে তৈরি, পচনশীল", "বারবার ব্যবহারযোগ্য বোতল", "প্লাস্টিক ফ্লসের বিকল্প"],
      name: "পরিবেশবান্ধব ডেন্টাল ফ্লস",
      short: "HAYATIQ বায়োডিগ্রেডেবল (মাটিতে মিশে যায় এমন) ডেন্টাল ফ্লস — প্রতিদিনের মুখের যত্নে প্রচলিত প্লাস্টিক ফ্লসের সহজ ও মজবুত বিকল্প।",
      how: [
        "ফ্লস: আগে-পিছে আলতো নাড়িয়ে দাঁতের ফাঁকে ফ্লস ঢোকান।; প্রতিটি দাঁতের গায়ে বাঁকিয়ে মাড়ির কিনারা বরাবর আলতো করে নাড়ান।; প্রতিটি ফাঁকের জন্য ফ্লসের নতুন অংশ ব্যবহার করুন।; আলতো করে করুন — ফ্লস করতে ব্যথা লাগা উচিত নয়।;",
      ],
      tips: [
        "ভুট্টা থেকে তৈরি পচনশীল উপাদানে বানানো — প্রতিদিনের মুখের যত্নে পরিবেশের কথা ভেবে একটি ভালো পছন্দ।",
        "বোতলটি বারবার ব্যবহার করা যায় — ফ্লস শেষ হলে পুরোটা আবার না কিনে শুধু রিফিল নিন।",
      ],
      warns: [
        "শুধু দাঁতের জন্য। গিলবেন না।",
        "মাড়িতে জ্বালা এড়াতে আলতো করে ব্যবহার করুন।",
        "রক্ত পড়া, ব্যথা বা অস্বস্তি না কমলে দাঁতের ডাক্তারের পরামর্শ নিন।",
      ],
      storage: [
        "বোতল বন্ধ রেখে পরিষ্কার, শুকনো জায়গায় রাখুন।",
        "ফ্লসে বেশি আর্দ্রতা লাগতে দেবেন না।",
      ],
      variants: {
        bottled: { label: "বোতলসহ", subtitle: "বারবার ব্যবহারযোগ্য বোতলসহ" },
        refill: { label: "রিফিল", subtitle: "আপনার আগের বোতলের জন্য" },
      },
    },
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
    related: ["15"],
    display_order: null,
    variants: [
      {
        id: "bottled",
        label: "Bottled",
        default: true,
        subtitle: "Includes reusable bottle",
        price: 250,
        images: ["./images/hayatiq_biodegradable_floss_1.webp", "./images/hayatiq_biodegradable_floss_2.webp"],
      },
      {
        id: "refill",
        label: "Refill",
        default: false,
        subtitle: "For your existing bottle",
        price: 180,
        images: ["./images/hayatiq_biodegradable_floss_1.webp", "./images/hayatiq_biodegradable_floss_2.webp"],
      },
    ],
  },
  // ---- Cleaning Supply ----
  {
    // Renamed from "Non Toxic Solid Dish Soap" to match the finalized product copy.
    // Deliberately dropped the copy's "Block" suffix: the detail page appends the
    // selected variant's label to this name (see renderDetail() in script.js), so
    // keeping "Block" here rendered as "...Block Block" / "...Block Bar". Slug updated
    // to match the copy too (was "dish-soap") — update any ManyChat automation trigger
    // keyed to the old ref (see README.MD) to this new slug.
    id: "18",
    name: "Non-Toxic Solid Dish Soap",
    slug: "solid-dish-soap-block",
    category: "Cleaning Supply",
    short: "HAYATIQ Solid Dish Soap Block is a long-lasting, concentrated soap for dishes, grease, kitchen surfaces, glass and mirrors. Available in Bar & 500g Block options.",
    seoTitle: "Solid Dish Soap Block Bangladesh | Multi-Surface Cleaning Soap | HAYATIQ",
    metaKeywords: "solid dish soap, solid dish soap block, dish soap bar, solid dish soap Bangladesh, dishwashing soap bar, plastic-free dish soap, multi-purpose cleaning soap, multi-surface cleaning soap, dish soap Bangladesh, long-lasting dish soap, eco-friendly dish soap, plastic-free cleaning, zero-waste dish soap, solid kitchen cleaner, natural dish soap, cleaning soap bar",
    // Matches the brand's official ingredient declaration; descriptions are its own
    // "What's Inside" copy.
    // Shown as ticks under the description; worded from this product's own copy.
    benefits: ["Long-lasting & concentrated", "Dishes, surfaces, glass & mirrors", "Fresh lemon scent"],
    ingredients: [
      "<b>Raw Coconut Oil</b> — helps create a cleansing soap with good lather and grease-cutting ability.",
      "<b>Palm Oil</b> — helps give the soap a firm, long-lasting structure while contributing to its cleansing performance.",
      "<b>Castor Oil</b> — helps support a rich, creamy lather and pleasant washing experience.",
      "<b>Sunflower Oil</b> — adds a softer, more balanced feel to the soap.",
      "<b>Citric Acid</b> — used as part of the soap formulation to help support the finished product's cleaning characteristics.",
      "<b>Distilled Water</b> — used during the soap-making process.",
      "<b>Sodium Hydroxide</b> — an essential ingredient in traditional soap-making; it reacts with the oils during saponification and is consumed in the properly made finished soap.",
      "<b>Lemon Essential Oil</b> — adds a fresh, naturally bright lemon scent.",
      "<i>*All oils listed above are saponified during the soap-making process.</i>",
    ],
    how: [
      "Dishes & Cookware: Wet your sponge or dish brush.; Rub it directly over the soap block until you have a good lather.; Wash your dishes as usual, then rinse thoroughly with clean water.; For particularly greasy dishes, use warm water and repeat as needed.;",
      "Counters & Surfaces: Wet a cloth or sponge and work a small amount of soap into it.; Wipe the surface thoroughly, then rinse or wipe again with a clean damp cloth if needed.;",
      "Mirrors & Glass: Use a very small amount of soap with a damp cloth or sponge — less is more here.; Clean the mirror, then wipe away any remaining residue with a clean damp cloth.; Finish with a dry microfiber cloth for a clear, polished finish.; Too much soap can leave more residue behind, not less.;",
      "Laundry & Spot Cleaning: Wet the fabric, then rub a small amount of soap directly onto the area.; Gently work it in, then rinse thoroughly.; Great for everyday clothing, socks, towels and small hand-wash loads.; For delicate or specialty fabrics, test a small hidden area first.;",
    ],
    tips: [
      "A few gentle swipes of your sponge or brush against the block are enough — no need to scrub aggressively.",
      "For mirrors and glass, less is more: too much soap can leave more residue behind, not less.",
      "Always test an inconspicuous area first on delicate, polished, coated, painted or specialty surfaces.",
    ],
    warns: [
      "For external household cleaning use only. Do not ingest.",
      "Do not use as a body soap, hand soap, shampoo or personal-care product.",
      "Avoid contact with the eyes. If contact occurs, rinse thoroughly with clean water.",
      "Keep away from children and pets.",
      "For prolonged cleaning or if you have sensitive hands, wearing household cleaning gloves is recommended.",
      "Do not use on surfaces where the manufacturer specifically recommends avoiding soap or alkaline cleaners.",
      "For dishes and food-contact items, always rinse thoroughly with clean water after washing.",
    ],
    storage: [
      "Keep it on a draining soap dish or raised holder so excess water can escape.",
      "Let it dry completely between uses — don't leave it sitting in a puddle or directly under running water.",
      "If you cut the block into smaller pieces, keep the remaining pieces cool, dry, and out of standing water.",
      "Bangladesh's warm, humid climate makes drainage and drying even more important for how long the block lasts.",
      "Use it. Rinse it. Drain it. Let it dry.",
    ],
    bn: {
      benefits: ["দীর্ঘস্থায়ী ও ঘন", "থালাবাসন, তাক, কাচ ও আয়না", "সতেজ লেবুর সুবাস"],
      name: "নন-টক্সিক সলিড ডিশ সোপ",
      short: "HAYATIQ সলিড ডিশ সোপ ব্লক একটি দীর্ঘস্থায়ী, ঘন সাবান — থালাবাসন, তেল-চর্বি, রান্নাঘরের তাক, কাচ ও আয়না পরিষ্কারের জন্য। বার ও ৫০০ গ্রাম ব্লক — দুই ধরনে পাওয়া যায়।",
      ingredients: [
        "<b>কাঁচা নারকেল তেল</b> — ভালো ফেনা আর তেল-চর্বি কাটার ক্ষমতাসহ পরিষ্কারক সাবান তৈরিতে সাহায্য করে।",
        "<b>পাম তেল</b> — সাবানকে শক্ত ও দীর্ঘস্থায়ী করে, পরিষ্কারের ক্ষমতাও বাড়ায়।",
        "<b>ক্যাস্টর তেল</b> — ঘন, ক্রিমি ফেনা আর আরামদায়ক ধোয়ার অনুভূতি দেয়।",
        "<b>সূর্যমুখী তেল</b> — সাবানকে আরও কোমল ও ভারসাম্যপূর্ণ করে।",
        "<b>সাইট্রিক অ্যাসিড</b> — সাবানের ফর্মুলার অংশ, যা তৈরি সাবানের পরিষ্কার করার গুণ ঠিক রাখতে সাহায্য করে।",
        "<b>ডিস্টিল্ড পানি</b> — সাবান তৈরির প্রক্রিয়ায় ব্যবহৃত।",
        "<b>সোডিয়াম হাইড্রক্সাইড</b> — প্রচলিত সাবান তৈরির অপরিহার্য উপাদান; সাবান তৈরির সময় এটি তেলের সাথে বিক্রিয়া করে, আর ঠিকভাবে তৈরি সাবানে এটি আর থেকে যায় না।",
        "<b>লেবুর এসেনশিয়াল অয়েল</b> — সতেজ, প্রাকৃতিক লেবুর সুবাস দেয়।",
        "<i>*উপরের সব তেল সাবান তৈরির প্রক্রিয়ায় সাবানে রূপান্তরিত (স্যাপোনিফাইড) হয়।</i>",
      ],
      how: [
        "থালাবাসন ও হাঁড়িপাতিল: স্পঞ্জ বা ডিশ ব্রাশ ভিজিয়ে নিন।; ভালো ফেনা না হওয়া পর্যন্ত সরাসরি সাবানের উপর ঘষুন।; স্বাভাবিকভাবে থালাবাসন মেজে পরিষ্কার পানিতে ভালোভাবে ধুয়ে ফেলুন।; খুব তেলতেলে থালার জন্য গরম পানি ব্যবহার করুন, দরকার হলে আবার মাজুন।;",
        "কাউন্টার ও তাক: কাপড় বা স্পঞ্জ ভিজিয়ে তাতে অল্প সাবান লাগিয়ে নিন।; জায়গাটি ভালোভাবে মুছুন, দরকার হলে পরিষ্কার ভেজা কাপড় দিয়ে আবার মুছে নিন।;",
        "আয়না ও কাচ: ভেজা কাপড় বা স্পঞ্জে খুব অল্প সাবান নিন — এখানে যত কম, তত ভালো।; আয়না পরিষ্কার করে পরিষ্কার ভেজা কাপড় দিয়ে বাকি সাবানের দাগ মুছে ফেলুন।; ঝকঝকে করতে শেষে শুকনো মাইক্রোফাইবার কাপড় দিয়ে মুছুন।; বেশি সাবান দিলে দাগ কমে না, বরং বেশি থেকে যায়।;",
        "কাপড় ও দাগ পরিষ্কার: কাপড় ভিজিয়ে দাগের জায়গায় সরাসরি অল্প সাবান ঘষুন।; আলতো করে ঘষে ভালোভাবে ধুয়ে ফেলুন।; প্রতিদিনের জামাকাপড়, মোজা, তোয়ালে আর হাতে ধোয়ার অল্প কাপড়ের জন্য দারুণ।; নরম বা বিশেষ ধরনের কাপড়ে আগে চোখের আড়ালের ছোট জায়গায় পরীক্ষা করে নিন।;",
      ],
      tips: [
        "স্পঞ্জ বা ব্রাশ দিয়ে সাবানের উপর কয়েকবার আলতো ঘষাই যথেষ্ট — জোরে ঘষার দরকার নেই।",
        "আয়না ও কাচে যত কম, তত ভালো: বেশি সাবান দিলে দাগ কমে না, বরং বেশি থেকে যায়।",
        "নরম, পালিশ করা, কোটিং বা রং করা কিংবা বিশেষ ধরনের জায়গায় আগে চোখের আড়ালের ছোট জায়গায় পরীক্ষা করে নিন।",
      ],
      warns: [
        "শুধু ঘরোয়া পরিষ্কারের কাজে ব্যবহারের জন্য। খাবেন না।",
        "গায়ে মাখার সাবান, হ্যান্ডওয়াশ, শ্যাম্পু বা ব্যক্তিগত যত্নের পণ্য হিসেবে ব্যবহার করবেন না।",
        "চোখে লাগাবেন না। লেগে গেলে পরিষ্কার পানি দিয়ে ভালোভাবে ধুয়ে ফেলুন।",
        "শিশু ও পোষা প্রাণী থেকে দূরে রাখুন।",
        "অনেকক্ষণ ধরে পরিষ্কার করলে বা হাত সংবেদনশীল হলে গ্লাভস পরে নেওয়া ভালো।",
        "যে জিনিসে প্রস্তুতকারক সাবান বা ক্ষারীয় ক্লিনার ব্যবহার করতে নিষেধ করেছে, তাতে ব্যবহার করবেন না।",
        "থালাবাসন ও খাবারের পাত্র ধোয়ার পর সবসময় পরিষ্কার পানিতে ভালোভাবে ধুয়ে নিন।",
      ],
      storage: [
        "পানি ঝরে যায় এমন সোপ ডিশ বা উঁচু হোল্ডারে রাখুন, যাতে বাড়তি পানি বেরিয়ে যেতে পারে।",
        "প্রতিবার ব্যবহারের পর পুরোপুরি শুকাতে দিন — জমে থাকা পানিতে বা সরাসরি কলের পানির নিচে রেখে দেবেন না।",
        "ব্লক কেটে ছোট টুকরো করলে বাকি টুকরোগুলো ঠান্ডা, শুকনো জায়গায় আর জমা পানি থেকে দূরে রাখুন।",
        "বাংলাদেশের গরম, আর্দ্র আবহাওয়ায় ব্লক কতদিন টিকবে, তা অনেকটাই নির্ভর করে পানি ঝরানো ও শুকানোর উপর।",
        "ব্যবহার করুন। ধুয়ে নিন। পানি ঝরান। শুকাতে দিন।",
      ],
      variants: {
        bar: { label: "বার" },
        block: { label: "ব্লক" },
      },
    },
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: "popular",
    related: ["20", "21", "23"],
    display_order: 2,
    variants: [
      {
        id: "bar",
        label: "Bar",
        default: false,
        subtitle: "85g",
        price: 180,
        images: ["./images/hayatiq_dish_soap_bar.webp"],
      },
      {
        id: "block",
        label: "Block",
        default: true,
        subtitle: "500g",
        price: 750,
        images: ["./images/hayatiq_dish_soap_block.webp"],
      }
    ],
  },
  {
    id: "20",
    name: "Non Toxic Toilet Cleaning Pods",
    subtitle: "Pack of 7 · 30g each",
    slug: "toilet-cleaning-pods",
    price: 370,
    category: "Cleaning Supply",
    images: ["./images/hayatiq_toilet_cleaning_pods.webp"],
    short: "Non-toxic toilet cleaning pods, pack of 7.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "নন-টক্সিক টয়লেট ক্লিনিং পড",
      subtitle: "৭টির প্যাক · প্রতিটি ৩০ গ্রাম",
      short: "নন-টক্সিক টয়লেট ক্লিনিং পড, ৭টির প্যাক।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["23", "18", "21"],
    display_order: null,
  },
  {
    id: "21",
    name: "Non Toxic Foaming Handwash Tablets",
    subtitle: "Pack of 2 · 500ml",
    slug: "handwash-tablets-pack-of-2",
    price: 200,
    category: "Cleaning Supply",
    images: ["./images/placeholder.webp"],
    short: "Non-toxic foaming handwash tablets.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "নন-টক্সিক ফোমিং হ্যান্ডওয়াশ ট্যাবলেট",
      subtitle: "২টির প্যাক · ৫০০ মিলি",
      short: "নন-টক্সিক ফোমিং হ্যান্ডওয়াশ ট্যাবলেট।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["22", "18", "23"],
    display_order: null,
  },
  {
    id: "22",
    name: "Non Toxic Foaming Handwash Tablets",
    subtitle: "Pack of 4 · 1000ml",
    slug: "handwash-tablets-pack-of-4",
    price: 380,
    category: "Cleaning Supply",
    images: ["./images/placeholder.webp"],
    short: "Non-toxic foaming handwash tablets.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "নন-টক্সিক ফোমিং হ্যান্ডওয়াশ ট্যাবলেট",
      subtitle: "৪টির প্যাক · ১০০০ মিলি",
      short: "নন-টক্সিক ফোমিং হ্যান্ডওয়াশ ট্যাবলেট।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["21", "18", "23"],
    display_order: null,
  },
  {
    id: "23",
    name: "Non Toxic All Purpose Cleaning Tablets",
    subtitle: "Pack of 2 · 600ml",
    slug: "all-purpose-cleaning-tablets",
    price: 300,
    category: "Cleaning Supply",
    images: ["./images/placeholder.webp"],
    short: "Non-toxic all-purpose cleaning tablets.",
    ingredients: [],
    how: [],
    tips: [],
    warns: PLACEHOLDER_WARNS,
    storage: PLACEHOLDER_STORAGE,
    bn: {
      name: "নন-টক্সিক অল-পারপাস ক্লিনিং ট্যাবলেট",
      subtitle: "২টির প্যাক · ৬০০ মিলি",
      short: "নন-টক্সিক অল-পারপাস ক্লিনিং ট্যাবলেট।",
      warns: PLACEHOLDER_WARNS_BN,
      storage: PLACEHOLDER_STORAGE_BN,
    },
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
    related: ["20", "18", "21"],
    display_order: null,
  },
];

// Optional per-product `display_order` (number) controls listing order everywhere a
// product grid/carousel renders — ascending, lowest first (see README.MD). Sorting
// once here makes every render function that reads PRODUCTS honor it automatically.
// Unset (null) sorts last, after any product with an explicit order. Ties (equal
// display_order, or several unset) keep their relative array order — no tie-break
// needed since Array#sort is stable.
PRODUCTS.sort((a, b) => {
  const orderA = typeof a.display_order === "number" ? a.display_order : Infinity;
  const orderB = typeof b.display_order === "number" ? b.display_order : Infinity;
  return orderA - orderB;
});
