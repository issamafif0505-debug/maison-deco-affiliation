import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Envoyer à n8n webhook (si configuré)
    const n8nWebhookUrl = import.meta.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: body.product,
          asin: body.asin,
          price: body.price,
          page: body.page,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silencieux si n8n non disponible
      });
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ status: 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
