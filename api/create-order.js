import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { amount } =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order =
      await razorpay.orders.create({
        amount: Number(amount) * 100,
        currency: "INR",
        receipt: `smartsplit_${Date.now()}`,
      });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error(
      "Razorpay order error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
}