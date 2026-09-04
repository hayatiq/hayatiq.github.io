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
    concerns: [],
    reviews: [],
    // Set to true to feature this product in the homepage "Top Selling Products" carousel.
    topSelling: false,
    // Set to "hot" / "new" / "sale" / "popular" (or leave null) — see README.MD.
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: "new",
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
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: "new",
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
      "./images/hayatiq_magnesium_oil_2.jpg",
      "./images/hayatiq_magnesium_oil_3.jpg",
    ],
    short: "Nature’s Calm in Every Spray",
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
    concerns: ["Better Sleep", "Muscle Recovery"],
    // DEMO PREVIEW DATA — for layout preview only, replace with real reviews before
    // launch (see README.MD "Adding Customer Reviews"). Remove this comment and the
    // two entries below once real feedback is added.
    reviews: [
      { name: "Nusrat A.", rating: 5, text: "This has genuinely improved my sleep. A few sprays on my feet before bed and I feel so much more relaxed — the scent is mild too, no irritation at all. Highly recommend!" },
      { name: "Rakibul H.", rating: 4.5, text: "Using this for muscle cramps after workouts and it really helps. Had a bit of tingling the first couple of days but that faded quickly. Would love a bigger bottle option." },
    ],
    // Set to true to feature this product in the homepage "Top Selling Products" carousel.
    topSelling: false,
    badge: null,
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
      "./images/hayatiq_magnesium_oil_2.jpg",
      "./images/hayatiq_magnesium_oil_3.jpg",
    ],
    short: "Nature’s Calm in Every Spray",
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
    concerns: ["Better Sleep", "Muscle Recovery"],
    // Fill in real customer reviews here as they come in — see README.MD.
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: ["Better Sleep", "Muscle Recovery"],
    reviews: [],
    topSelling: true,
    badge: "hot",
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
    concerns: ["Muscle Recovery"],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: true,
    badge: "popular",
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
    concerns: [],
    reviews: [],
    topSelling: false,
    badge: null,
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
