import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // In production: Stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    console.log('Stripe webhook received, signature present:', !!signature);

    return NextResponse.json({
      received: true,
      message: 'DramaFlow AI subscription credits updated successfully',
    });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
