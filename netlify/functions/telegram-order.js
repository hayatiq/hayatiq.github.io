exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, phone, address, note, cart, total, time } = data;

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables.");
      return { statusCode: 500, body: JSON.stringify({ error: "Configuration missing" }) };
    }

    // Format the cart items
    let cartText = "";
    if (typeof cart === 'string') {
      cartText = cart;
    } else if (cart && Array.isArray(cart)) {
      cartText = cart.map(item => `- ${item.name} (x${item.quantity}) - ৳${item.price * item.quantity}`).join("\n");
    } else {
      cartText = "No items provided";
    }

    // Format the message according to desired layout
    const message = `🛒 *NEW ORDER*

👤 *Customer:*
Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Address: ${address || 'N/A'}
${note ? `Note: ${note}\n` : ''}
📦 *Product:*
${cartText}

💰 *Total:*
৳${total || 0}

🕐 *Order Time:*
${time || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // Fetch is available globally in Node.js 18+ (Netlify standard)
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API Error:", errorText);
      return { statusCode: 502, body: JSON.stringify({ error: "Failed to send to Telegram" }) };
    }

    return { 
      statusCode: 200, 
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, message: "Sent to Telegram successfully" }) 
    };
  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
