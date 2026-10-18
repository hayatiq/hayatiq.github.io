/* ==============================
       Bangla / English
       ============================== */
// A বাংলা / EN switch in the header (on or off with SHOW_BANGLA in js/config.js).
// In Bangla mode every piece of text on the page is swapped for its translation,
// including text rendered later (the same way js/icons.js swaps icons):
// - interface text: BN (exact text) and BN_PATTERNS (text with numbers or names in it)
// - product names and content: each product's `bn` block in js/products.js
// - text joined from those, like "Bar · 85g" or "Name (option)": bnLoose()
// Sizes, counts and dates get Bangla digits; prices keep English ones (৳850).
// Only the page changes: the data, the order emails, Telegram, the sheet and the PDF
// invoice stay English.
// The choice is kept in localStorage; switching reloads the page.

const LANG_KEY = "hayatiq_lang";
const LANG = (() => {
  try {
    return SHOW_BANGLA && localStorage.getItem(LANG_KEY) === "bn" ? "bn" : "en";
  } catch (e) {
    return "en";
  }
})();

const BN = {
  // Header, menu, footer
  "Products": "পণ্য",
  "Categories": "ক্যাটাগরি",
  "About": "আমাদের কথা",
  "Contact": "যোগাযোগ",
  "Toggle navigation": "মেনু",
  "Explore": "দেখুন",
  "Social": "সোশ্যাল",
  "Facebook": "ফেসবুক",
  "Handcrafted with intention. Natural wellness products for your everyday rituals.": "যত্ন নিয়ে হাতে তৈরি। আপনার প্রতিদিনের জন্য প্রাকৃতিক ওয়েলনেস পণ্য।",
  "HAYATIQ. All rights reserved. Handcrafted with Intention.": "HAYATIQ. সর্বস্বত্ব সংরক্ষিত। যত্ন নিয়ে হাতে তৈরি।",

  // Home
  "Natural Self-Care for Everyday You": "প্রতিদিনের জন্য প্রাকৃতিক যত্ন",
  "Handmade in small batches with natural ingredients.": "প্রাকৃতিক উপাদানে, অল্প পরিমাণে হাতে তৈরি।",
  "Best Sellers": "সবচেয়ে জনপ্রিয়",
  "Need Help Choosing?": "বাছাইয়ে সাহায্য লাগবে?",
  "Best Seller": "বেস্ট সেলার",
  "Popular": "জনপ্রিয়",
  "Hot": "হট",
  "New": "নতুন",
  "Sale": "সেল",
  "Customer Love": "গ্রাহকদের ভালোবাসা",
  "Shop Our Products": "আমাদের পণ্য",
  "View All": "সব দেখুন",
  "View More Products": "আরও পণ্য দেখুন",
  "Shop by Category": "ক্যাটাগরি অনুযায়ী কিনুন",
  "All Products": "সব পণ্য",
  "Find the Right Product": "আপনার জন্য সঠিক পণ্য",
  "Better Sleep": "ভালো ঘুম",
  "Muscle Recovery": "পেশির আরাম",
  "How to Order": "কীভাবে অর্ডার করবেন",
  "1. Browse & Choose": "১. দেখুন ও বাছাই করুন",
  "Explore our products by category and pick what fits your routine.": "ক্যাটাগরি অনুযায়ী পণ্য দেখুন, আপনার প্রয়োজন মতো বাছাই করুন।",
  "2. Add to Cart": "২. কার্টে যোগ করুন",
  "Tap the cart icon on any product — no account needed.": "যেকোনো পণ্যের কার্ট আইকনে চাপুন — কোনো অ্যাকাউন্ট লাগবে না।",
  "3. Confirm Your Order": "৩. অর্ডার নিশ্চিত করুন",
  "Enter your name, phone, and address, and choose Cash on Delivery.": "নাম, ফোন নম্বর ও ঠিকানা দিন — পেমেন্ট ক্যাশ অন ডেলিভারি।",
  "4. Receive & Pay": "৪. বুঝে নিন, তারপর পেমেন্ট",
  "Check your order when it arrives, then pay the courier in cash.": "পণ্য হাতে পেয়ে দেখে নিন, তারপর কুরিয়ারকে নগদ টাকা দিন।",
  "What Happens After You Order": "অর্ডারের পর কী হয়",
  "Your order goes straight to our team — no accounts, no waiting on hold.": "আপনার অর্ডার সরাসরি আমাদের টিমের কাছে যায় — কোনো অ্যাকাউন্ট বা অপেক্ষা নেই।",
  "We prepare and dispatch it for delivery, Inside or Outside Dhaka.": "আমরা প্যাক করে ঢাকার ভেতরে বা বাইরে পাঠিয়ে দিই।",
  "Pay by cash when it arrives — you can check your order before you pay.": "পণ্য পৌঁছালে নগদে পেমেন্ট করুন — টাকা দেওয়ার আগে দেখে নিতে পারবেন।",
  "Questions anytime? Message us on": "যেকোনো প্রশ্ন? মেসেজ করুন",
  "— we reply directly.": "— আমরা সরাসরি উত্তর দিই।",
  "Frequently Asked Questions": "সাধারণ প্রশ্ন",
  "Is Cash on Delivery really available?": "সত্যিই কি ক্যাশ অন ডেলিভারি আছে?",
  "Yes — every order is Cash on Delivery. You can check your item when the courier arrives and pay in cash right then, no advance payment needed.": "হ্যাঁ — সব অর্ডারই ক্যাশ অন ডেলিভারি। কুরিয়ার এলে পণ্য দেখে নিয়ে তখনই নগদে পেমেন্ট করবেন, আগে কোনো টাকা দিতে হবে না।",
  "Do I need to create an account to order?": "অর্ডার করতে কি অ্যাকাউন্ট খুলতে হবে?",
  "No account needed. Add items to your cart, fill in your name, phone number, and delivery address at checkout, and place your order.": "না, অ্যাকাউন্ট লাগবে না। পণ্য কার্টে যোগ করুন, চেকআউটে নাম, ফোন নম্বর ও ঠিকানা দিয়ে অর্ডার করুন।",
  "Which areas do you deliver to?": "কোন কোন এলাকায় ডেলিভারি দেন?",
  "We deliver nationwide — Inside Dhaka (৳80) and Outside Dhaka (৳130).": "সারা দেশে ডেলিভারি দিই — ঢাকার ভেতরে (৳80) এবং ঢাকার বাইরে (৳130)।",
  "Is the Magnesium Oil Spray safe for sensitive skin?": "সংবেদনশীল ত্বকে কি ম্যাগনেসিয়াম অয়েল স্প্রে নিরাপদ?",
  "We recommend a patch test on a small area first. A mild tingling on first use is normal and fades with regular use — you can dilute it with water if needed. Avoid the eyes, mouth, broken skin, and freshly shaved skin, and it's for external use only.": "প্রথমে অল্প জায়গায় প্যাচ টেস্ট করে নিন। প্রথমবার হালকা ঝিনঝিন লাগা স্বাভাবিক, নিয়মিত ব্যবহারে কমে যায় — দরকার হলে পানি মিশিয়ে নিন। চোখ, মুখ, কাটা ত্বক ও সদ্য শেভ করা জায়গায় লাগাবেন না; শুধু বাহ্যিক ব্যবহারের জন্য।",
  "How do I get in touch if I have a question?": "প্রশ্ন থাকলে কীভাবে যোগাযোগ করব?",
  "Message us on": "মেসেজ করুন",
  ", or use the": ", অথবা ব্যবহার করুন",
  "page.": "পেজ।",
  "Why HAYATIQ?": "কেন HAYATIQ?",
  "We believe wellness should be gentle, honest, and effective. Each product is handcrafted in small batches using thoughtfully sourced ingredients, and every batch is tested for quality, stability, and safety before it reaches you. We create products we love to use ourselves, minimal formulas that let your natural glow shine.": "আমরা বিশ্বাস করি যত্ন হওয়া উচিত কোমল, সৎ ও কার্যকর। প্রতিটি পণ্য বাছাই করা উপাদানে অল্প পরিমাণে হাতে তৈরি, আর প্রতিটি ব্যাচ আপনার কাছে পৌঁছানোর আগে মান ও নিরাপত্তার জন্য পরীক্ষা করা হয়। আমরা নিজেরা যা ব্যবহার করতে ভালোবাসি, সেটাই বানাই — সহজ ফর্মুলা, প্রাকৃতিক সৌন্দর্যের জন্য।",
  "Let’s Talk": "কথা বলি",
  "Have a question about our blends? We’d love to hear from you.": "আমাদের পণ্য নিয়ে কোনো প্রশ্ন? জানাতে দ্বিধা করবেন না।",
  "Contact Us": "যোগাযোগ করুন",

  // Home: hero, chips, order steps, brand band
  "Shop Now": "এখনই কিনুন",
  "Handmade": "হাতে তৈরি",
  "Shop by need:": "প্রয়োজন অনুযায়ী:",
  "Stress & Anxiety": "স্ট্রেস ও দুশ্চিন্তা",
  "Choose": "বাছাই করুন",
  "Add to cart — no account needed.": "কার্টে যোগ করুন — অ্যাকাউন্ট লাগবে না।",
  "Order": "অর্ডার করুন",
  "Just your name, phone and address.": "শুধু নাম, ফোন নম্বর আর ঠিকানা।",
  "We deliver": "আমরা পৌঁছে দিই",
  "Inside or Outside Dhaka, by courier.": "ঢাকার ভেতরে বা বাইরে, কুরিয়ারে।",
  "Pay on delivery": "হাতে পেয়ে পেমেন্ট",
  "Check your order, then pay in cash.": "পণ্য দেখে নিয়ে নগদে টাকা দিন।",
  "All": "সব",

  // Categories
  "Hair Care": "চুলের যত্ন",
  "Magnesium Oil Spray": "ম্যাগনেসিয়াম অয়েল স্প্রে",
  "Salves & Balms": "সালভ ও বাম",
  "Bath Bombs": "বাথ বম্ব",
  "Footsoaks": "ফুটসোক",
  "Oral Care": "মুখের যত্ন",
  "Cleaning Supply": "পরিষ্কারের পণ্য",
  "All Categories": "সব ক্যাটাগরি",
  "Shampoo bars, conditioner bar, scalp elixir": "শ্যাম্পু বার, কন্ডিশনার বার, স্ক্যাল্প এলিক্সির",
  "Daily wellness spray, in multiple strengths": "প্রতিদিনের ওয়েলনেস স্প্রে, বিভিন্ন মাত্রায়",
  "Topical salves for on-the-go relief": "যেকোনো সময় আরামের জন্য সালভ",
  "Botanical bath bombs, singles & sets": "ভেষজ বাথ বম্ব, একক ও সেট",
  "Relaxing botanical foot soaks": "আরামদায়ক ভেষজ ফুটসোক",
  "Tongue scrapers, biodegradable floss": "টাং স্ক্র্যাপার, পরিবেশবান্ধব ফ্লস",
  "Non-toxic dish soap, toilet cleaner & handwash tablets": "নিরাপদ ডিশ সোপ, টয়লেট ক্লিনার ও হ্যান্ডওয়াশ ট্যাবলেট",
  "Coming Soon": "শীঘ্রই আসছে",

  // About, contact, 404
  "Our Story": "আমাদের গল্প",
  "Born from a love of simple rituals, HAYATIQ crafts handmade beauty with a minimal, elegant touch. Our blends are inspired by nature and designed to soothe both skin and mind.": "সহজ, যত্নময় অভ্যাসের ভালোবাসা থেকে HAYATIQ-এর শুরু। আমরা হাতে তৈরি করি সহজ ও সুন্দর পণ্য — প্রকৃতি থেকে অনুপ্রাণিত, ত্বক ও মনকে আরাম দিতে।",
  "Send us a message below, or": "নিচে মেসেজ লিখুন, অথবা",
  "chat on Messenger": "মেসেঞ্জারে চ্যাট করুন",
  "Name": "নাম",
  "Phone or Email": "ফোন বা ইমেইল",
  "Message": "মেসেজ",
  "Send Message": "মেসেজ পাঠান",
  "Page Not Found": "পেজটি পাওয়া যায়নি",
  "We couldn't find the page you're looking for. It may have moved, or the link might be out of date.": "আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি। হয়তো সরানো হয়েছে, বা লিংকটি পুরোনো।",
  "Back to Home": "হোমে ফিরে যান",
  "Looking for something specific?": "নির্দিষ্ট কিছু খুঁজছেন?",
  "Ask us on Messenger": "মেসেঞ্জারে জিজ্ঞেস করুন",

  // Product page
  "Order Now": "এখনই অর্ডার করুন",
  "Add to Cart": "কার্টে যোগ করুন",
  "Ask a Question": "প্রশ্ন করুন",
  "Natural": "প্রাকৃতিক",
  "Quality Checked": "মান যাচাইকৃত",
  "Cash on delivery": "ক্যাশ অন ডেলিভারি",
  ": check your order before you pay.": ": টাকা দেওয়ার আগে পণ্য দেখে নিন।",
  "If anything arrives damaged, message us on Facebook and we'll sort it out.": "কোনো পণ্য ক্ষতিগ্রস্ত অবস্থায় পৌঁছালে ফেসবুকে মেসেজ করুন, আমরা সমাধান করে দেব।",
  "Facebook page": "ফেসবুক পেজ",
  "How to Use": "ব্যবহারের নিয়ম",
  "Ingredients": "উপাদান",
  "Cautions": "সতর্কতা",
  "For Optimal Benefits": "সেরা ফলের জন্য",
  "Storage": "সংরক্ষণ",
  "Reviews": "রিভিউ",
  "You may also like": "আপনার পছন্দ হতে পারে",
  "Shape:": "আকার:",
  "Scent:": "সুগন্ধ:",
  "Style:": "স্টাইল:",
  "Color Layer:": "রঙের স্তর:",
  "Color:": "রং:",
  "Size:": "সাইজ:",
  "Type:": "ধরন:",
  "Botanical:": "ভেষজ:",
  "Choose an option": "একটি বাছাই করুন",
  "&": "ও",

  // Products list, wishlist, cart
  "Your Wishlist": "আপনার পছন্দের তালিকা",
  "Your wishlist is empty. Tap the ♥ on any product to save it here.": "পছন্দের তালিকা খালি। যেকোনো পণ্যের ♥ চাপলে এখানে জমা থাকবে।",
  "Browse products": "পণ্য দেখুন",
  "Your Cart": "আপনার কার্ট",
  "Your cart is empty.": "আপনার কার্ট খালি।",
  "Your cart is empty": "আপনার কার্ট খালি",
  "Shop products": "কেনাকাটা করুন",
  "Total": "মোট",
  "Checkout": "চেকআউট",
  "Clear cart": "কার্ট খালি করুন",
  "Need help before you order?": "অর্ডারের আগে সাহায্য লাগবে?",
  "Chat with us": "চ্যাট করুন",
  "View Full Cart": "পুরো কার্ট দেখুন",
  "This product is no longer available.": "এই পণ্যটি আর পাওয়া যাচ্ছে না।",

  // Checkout
  "Questions first?": "আগে কিছু জানতে চান?",
  "Chat with us on Messenger": "মেসেঞ্জারে চ্যাট করুন",
  "Full Name *": "পূর্ণ নাম *",
  "Phone Number *": "ফোন নম্বর *",
  "Delivery Address *": "ডেলিভারির ঠিকানা *",
  "Delivery Area *": "ডেলিভারি এলাকা *",
  "Inside Dhaka": "ঢাকার ভেতরে",
  "Outside Dhaka": "ঢাকার বাইরে",
  "about 2 days": "প্রায় ২ দিন",
  "3–5 days": "৩–৫ দিন",
  "Order Summary": "অর্ডারের বিবরণ",
  "Subtotal:": "সাবটোটাল:",
  "Delivery:": "ডেলিভারি:",
  "Choose an area": "এলাকা বাছাই করুন",
  "Total:": "মোট:",
  "Order Note (Optional)": "অর্ডার নোট (ঐচ্ছিক)",
  "Pay in cash when your order arrives — inspect it before you pay. No advance payment required.": "পণ্য পৌঁছালে নগদে পেমেন্ট করুন — টাকা দেওয়ার আগে দেখে নিন। কোনো অগ্রিম পেমেন্ট লাগবে না।",
  "Place Order": "অর্ডার করুন",
  "Placing order...": "অর্ডার হচ্ছে...",
  "Please enter an 11-digit mobile number, e.g. 01712345678": "১১ সংখ্যার মোবাইল নম্বর দিন, যেমন 01712345678",
  "Please choose your delivery area": "ডেলিভারি এলাকা বাছাই করুন",
  "Order limit reached. Please try again later.": "অর্ডারের সীমা পূর্ণ হয়েছে। একটু পরে আবার চেষ্টা করুন।",

  // Order page and invoice
  "No recent order": "সাম্প্রতিক কোনো অর্ডার নেই",
  "Orders you place on this phone show up here.": "এই ফোন থেকে করা অর্ডার এখানে দেখা যাবে।",
  "TEST ORDER: nothing was sent": "টেস্ট অর্ডার: কিছু পাঠানো হয়নি",
  "Your order is placed. We'll call": "আপনার অর্ডার হয়েছে। নিশ্চিত করতে আমরা কল করব",
  "to confirm it.": "নম্বরে।",
  "Invoice": "ইনভয়েস",
  "Billed to": "ক্রেতা",
  "Payment": "পেমেন্ট",
  "Item": "পণ্য",
  "Qty": "পরিমাণ",
  "Amount": "মূল্য",
  "Subtotal": "সাবটোটাল",
  "Total to pay on delivery": "ডেলিভারিতে মোট পরিশোধ",
  "Note:": "নোট:",
  "Download PDF": "PDF ডাউনলোড",
  "Copy order no.": "অর্ডার নম্বর কপি",
  "What happens next": "এরপর কী হবে",
  "We call you to confirm your order.": "অর্ডার নিশ্চিত করতে আমরা আপনাকে কল করব।",
  "Check your order when it arrives, then pay the courier in cash.": "পণ্য হাতে পেয়ে দেখে নিন, তারপর কুরিয়ারকে নগদ টাকা দিন।",
  "Message us": "মেসেজ করুন",
  "Continue shopping": "কেনাকাটা চালিয়ে যান",
  "We couldn't send your order": "আপনার অর্ডার পাঠানো যায়নি",
  "Your cart is saved. Please send us the order below on Messenger and we'll confirm it there, or try again.": "আপনার কার্ট সংরক্ষিত আছে। নিচের অর্ডারটি মেসেঞ্জারে পাঠান, আমরা সেখানে নিশ্চিত করব — অথবা আবার চেষ্টা করুন।",
  "Copy order": "অর্ডার কপি",
  "Try again": "আবার চেষ্টা",

  // Share, My orders
  "Copy link": "লিংক কপি",
  "Link copied": "লিংক কপি হয়েছে",
  "My Orders": "আমার অর্ডার",
  "My orders": "আমার অর্ডার",
  "No orders on this phone yet.": "এই ফোন থেকে এখনো কোনো অর্ডার করা হয়নি।",
  "Orders placed on this phone. For updates, message us with the order number.": "এই ফোন থেকে করা অর্ডার। অর্ডারের খবর জানতে অর্ডার নম্বরসহ আমাদের মেসেজ করুন।",
  "Ask about this order": "এই অর্ডার নিয়ে জিজ্ঞেস করুন",
  "Order again": "আবার অর্ডার করুন",
  "Remove": "মুছে ফেলুন",
  "Test": "টেস্ট",
  "These products are no longer available.": "এই পণ্যগুলো আর পাওয়া যাচ্ছে না।",
  "Long-press the invoice to save it.": "ইনভয়েস সেভ করতে ছবিতে চেপে ধরে রাখুন।",

  // Notices
  "Added to wishlist": "পছন্দের তালিকায় যোগ হয়েছে",
  "Removed from wishlist": "পছন্দের তালিকা থেকে সরানো হয়েছে",
  "Maximum quantity reached": "সর্বোচ্চ পরিমাণ হয়ে গেছে",
  "Copied": "কপি হয়েছে",
  "Order copied": "অর্ডার কপি হয়েছে",
  "Order number copied": "অর্ডার নম্বর কপি হয়েছে",
  "Invoice downloaded": "ইনভয়েস ডাউনলোড হয়েছে",
  "Sent!": "পাঠানো হয়েছে!",
  "Sending...": "পাঠানো হচ্ছে...",
  "Couldn't create the invoice. Please take a screenshot instead.": "ইনভয়েস তৈরি করা যায়নি। দয়া করে স্ক্রিনশট নিয়ে রাখুন।",
  "⚠️ You have reached your submission limit. Please try again later.": "⚠️ আপনি মেসেজ পাঠানোর সীমা পূর্ণ করেছেন। একটু পরে আবার চেষ্টা করুন।",
  "✅ We have received your message and will get back to you soon. Redirecting...": "✅ আপনার মেসেজ পেয়েছি, শীঘ্রই উত্তর দেব। অন্য পেজে নেওয়া হচ্ছে...",
  "✅ Test message: nothing was sent. Redirecting...": "✅ টেস্ট মেসেজ: কিছু পাঠানো হয়নি। অন্য পেজে নেওয়া হচ্ছে...",
  "❌ Something went wrong. Please try again later.": "❌ কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",

  // Placeholders
  "Your full name": "আপনার পূর্ণ নাম",
  "e.g., +8801..., or name@email.com": "যেমন 01XXXXXXXXX বা name@email.com",
  "How can we help?": "কীভাবে সাহায্য করতে পারি?",
  "House, road, area, thana, district": "বাসা, রোড, এলাকা, থানা, জেলা",
  "Any special instructions?": "বিশেষ কোনো নির্দেশনা?",
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const bnNum = (text) => String(text).replace(/\d/g, (d) => BN_DIGITS[d]);
const BN_MONTHS = { Jan: "জানুয়ারি", Feb: "ফেব্রুয়ারি", Mar: "মার্চ", Apr: "এপ্রিল", May: "মে", Jun: "জুন", Jul: "জুলাই", Aug: "আগস্ট", Sep: "সেপ্টেম্বর", Oct: "অক্টোবর", Nov: "নভেম্বর", Dec: "ডিসেম্বর" };

// Text with numbers, prices or names inside. Captured names and options go through
// bnLoose() too.
const BN_PATTERNS = [
  [/^(\d+) available$/, (m, n) => `${bnNum(n)}টি পাওয়া যাচ্ছে`],
  [/^(\d+) items?$/, (m, n) => `${bnNum(n)}টি পণ্য`],
  [/^(\d+) variants · (.+)$/, (m, n, rest) => `${bnNum(n)}টি ধরন · ${bnLoose(rest) || rest}`],
  [/^Place Order · (.+)$/, (m, total) => `অর্ডার করুন · ${total}`],
  [/^Thank you, (.+)!$/, (m, name) => `ধন্যবাদ, ${name}!`],
  [/^Added to cart: (.+)$/, (m, item) => `কার্টে যোগ হয়েছে: ${bnLoose(item) || item}`],
  [/^Delivery \((.+)\)$/, (m, area) => `ডেলিভারি (${bn(area)})`],
  [/^(৳[\d,]+) each$/, (m, price) => `প্রতিটি ${price}`],
  [/^Dhaka (৳[\d,]+) · (.+)$/, (m, price, time) => `ঢাকা ${price} · ${bn(time) || time}`],
  [/^Outside Dhaka (৳[\d,]+) · (.+)$/, (m, price, time) => `ঢাকার বাইরে ${price} · ${bn(time) || time}`],
  [/^(\d+) \/ (\d+)$/, (m, a, b) => `${bnNum(a)} / ${bnNum(b)}`],
  [/^You placed this same order (\d+) min ago \((.+)\)\. Place it again\?$/, (m, n, id) => `আপনি ${bnNum(n)} মিনিট আগে ঠিক এই অর্ডারটি করেছেন (${id})। আবার অর্ডার করবেন?`],
  [/^× (\d+)$/, (m, n) => `× ${bnNum(n)}`],
  [/^(\d+)(g|ml)(\+?)$/, (m, n, unit, plus) => `${bnNum(n)} ${unit === "g" ? "গ্রাম" : "মিলি"}${plus}`],
  [/^(\d+) (\w{3}) (\d{4}), (\d+):(\d+) (am|pm)$/, (m, d, mon, y, h, min, ap) => bnNum(`${d} ${BN_MONTHS[mon] || mon} ${y}, ${h}:${min}`) + (ap === "am" ? " AM" : " PM")],
  [/^(Inside|Outside) Dhaka, (.+)$/, (m, side, time) => `${bn(`${side} Dhaka`)}, ${bn(time)}`],
  [/^We send it by courier\. Delivery (Inside|Outside) Dhaka: (.+)\.$/, (m, side, time) => `কুরিয়ারে পাঠাই। ${bn(`${side} Dhaka`)} ডেলিভারি: ${bn(time)}।`],
  [/^💵 Cash on delivery · 🚚 Dhaka (৳\d+) \((.+?)\) · Outside Dhaka (৳\d+) \((.+?)\)$/, (m, a, at, b, bt) => `💵 ক্যাশ অন ডেলিভারি · 🚚 ঢাকা ${a} (${bn(at)}) · ঢাকার বাইরে ${b} (${bn(bt)})`],
  [/^Inside Dhaka (৳\d+) \((.+?)\) · Outside Dhaka (৳\d+) \((.+?)\)$/, (m, a, at, b, bt) => `ঢাকার ভেতরে ${a} (${bn(at)}) · ঢাকার বাইরে ${b} (${bn(bt)})`],
  [/^Delivery is added at checkout: Inside Dhaka (৳\d+), Outside Dhaka (৳\d+)\.$/, (m, a, b) => `ডেলিভারি চার্জ চেকআউটে যোগ হবে: ঢাকার ভেতরে ${a}, ঢাকার বাইরে ${b}।`],
];

function bn(text) {
  if (Object.prototype.hasOwnProperty.call(BN, text)) return BN[text];
  for (const [pattern, make] of BN_PATTERNS) {
    const match = pattern.exec(text);
    if (match) return make(...match);
  }
  return null;
}

// Text built from translatable parts: "Name (option)", "Bar · 85g",
// "Color: Single Color (Pink)". Returns null when no part has a translation.
function bnLoose(text) {
  const exact = bn(text);
  if (exact) return exact;
  const joined = (parts, glue) => {
    const done = parts.map((part) => bnLoose(part));
    return done.some(Boolean) ? parts.map((part, i) => done[i] || part).join(glue) : null;
  };
  const paren = /^([^()]+?) \((.+)\)$/.exec(text);
  if (paren) {
    const done = [bnLoose(paren[1]), bnLoose(paren[2])];
    return done.some(Boolean) ? `${done[0] || paren[1]} (${done[1] || paren[2]})` : null;
  }
  if (text.includes(" · ")) return joined(text.split(" · "), " · ");
  const labelled = /^([^:]+): (.+)$/.exec(text);
  if (labelled && bn(`${labelled[1]}:`)) return `${bn(`${labelled[1]}:`)} ${bnLoose(labelled[2]) || labelled[2]}`;
  return null;
}

/* ---------- Product content ---------- */

// The text pieces of an HTML string, as the page shows them (one per text node).
function textPieces(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html);
  const pieces = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const piece = walker.currentNode.nodeValue.trim();
    if (piece) pieces.push(piece);
  }
  return pieces;
}

// Adds an English text and its Bangla version to BN, piece by piece.
function pairText(en, bnText) {
  if (!en || !bnText) return;
  const a = textPieces(en);
  const b = textPieces(bnText);
  if (a.length !== b.length) {
    console.warn("Bangla text has a different shape from its English, skipped:", en);
    return;
  }
  a.forEach((piece, i) => {
    BN[piece] = b[i];
  });
}

// "Tab Name: point one; point two;" (see renderHowToUseTags() in script.js).
function howToPieces(item) {
  const [tab, ...rest] = item.split(":");
  return [tab, ...rest.join(":").split(";").filter((point) => point.trim())];
}

function addProductTranslations() {
  PRODUCTS.forEach((p) => {
    const t = p.bn;
    if (!t) return;
    ["name", "subtitle", "short", "howToUseNote"].forEach((key) => pairText(p[key], t[key]));
    ["ingredients", "tips", "warns", "storage", "benefits"].forEach((key) => (p[key] || []).forEach((item, i) => pairText(item, (t[key] || [])[i])));
    (p.how || []).forEach((item, i) => {
      if (!t.how || !t.how[i]) return;
      const a = howToPieces(item);
      const b = howToPieces(t.how[i]);
      if (a.length !== b.length) console.warn("Bangla how-to has a different number of points, skipped:", item);
      else a.forEach((piece, j) => pairText(piece, b[j]));
    });
    (p.variants || []).forEach((v) => {
      const tv = (t.variants || {})[v.id];
      if (!tv) return;
      pairText(v.label, tv.label);
      pairText(v.subtitle, tv.subtitle);
      // The product page title is "Name Variant".
      if (v.label && tv.label && t.name) BN[`${p.name} ${v.label}`] = `${t.name} ${tv.label}`;
    });
    Object.assign(BN, t.choices || {});
  });
}

/* ---------- The page ---------- */

function translateText(text) {
  let out = bnLoose(text) || text;
  // Bangla digits in text that's only a number (counts, quantities). Prices keep
  // English digits: in Bangla, ৳ and ৮ look almost the same ("৳৮৫০").
  if (/^[\d,]+$/.test(out)) out = bnNum(out);
  return out;
}

function translateNode(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    const raw = root.nodeValue;
    const text = raw.trim();
    if (!text || (root.parentElement && root.parentElement.closest(".order-report"))) return;
    const translated = translateText(text);
    if (translated !== text) root.nodeValue = raw.replace(text, translated);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || root.closest("script, style, .test-mode-banner")) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateNode);
  [root, ...root.querySelectorAll("[placeholder]")].forEach((el) => {
    const placeholder = el.getAttribute && el.getAttribute("placeholder");
    const translated = placeholder && bn(placeholder);
    if (translated) el.setAttribute("placeholder", translated);
  });
}

// For text shown outside the page (e.g. a confirm() box): translated in Bangla mode.
function tr(text) {
  return LANG === "bn" ? translateText(text) : text;
}

function setLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {}
  location.reload();
}

// The switch sits in the header bar, first in .nav-right (before the wishlist and
// cart icons on phones; css/style.css moves .nav-right to the far right on desktop).
if (SHOW_BANGLA) {
  const navRight = document.querySelector(".nav-right");
  if (navRight) {
    navRight.insertAdjacentHTML(
      "afterbegin",
      `<button type="button" class="lang-toggle" onclick="setLanguage('${LANG === "bn" ? "en" : "bn"}')" aria-label="${LANG === "bn" ? "Switch to English" : "বাংলায় দেখুন"}" lang="${LANG === "bn" ? "en" : "bn"}">${LANG === "bn" ? "EN" : "বাং"}</button>`
    );
  }
}

if (LANG === "bn") {
  addProductTranslations();
  document.documentElement.lang = "bn";
  translateNode(document.body);
  new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type === "characterData") translateNode(m.target);
      else m.addedNodes.forEach(translateNode);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
