// api/webhook.js
// Recebe confirmação de pagamento do AbacatePay e envia WhatsApp

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const evento = req.body;
    console.log('Webhook recebido:', JSON.stringify(evento));

    // AbacatePay envia evento quando pagamento é confirmado
    const status = evento?.data?.status || evento?.status;
    const isPago = status === 'PAID' || status === 'COMPLETED' || status === 'APPROVED';

    if (!isPago) {
      return res.status(200).json({ ok: true, msg: 'Evento ignorado' });
    }

    // Extrai dados do pagamento
    const billing = evento?.data || evento;
    const metadata = billing?.metadata || {};
    const customer = billing?.customer || {};
    const products = billing?.products || [];
    const total = (billing?.amount || billing?.total || 0) / 100;

    // Monta lista de produtos
    const itens = products.map(p =>
      `• ${p.quantity}x ${p.name} — R$ ${((p.price * p.quantity) / 100).toFixed(2).replace('.', ',')}`
    ).join('\n');

    // Monta mensagem para seu WhatsApp
    const msg =
      `💰 *PAGAMENTO CONFIRMADO — VitaZen*\n\n` +
      `👤 *Cliente:* ${customer.name || 'N/A'}\n` +
      `📱 *Telefone:* ${customer.cellphone || 'N/A'}\n` +
      `📧 *Email:* ${customer.email || 'N/A'}\n\n` +
      `📦 *Produtos pedidos:*\n${itens}\n\n` +
      `💳 *Total pago: R$ ${total.toFixed(2).replace('.', ',')}*\n\n` +
      `📍 *Endereço de entrega:*\n` +
      `${metadata.endereco || 'N/A'}\n` +
      `Bairro: ${metadata.bairro || 'N/A'}\n` +
      `${metadata.cidade || 'N/A'} — ${metadata.estado || 'N/A'}\n` +
      `CEP: ${metadata.cep || 'N/A'}\n\n` +
      `✅ *Enviar produto para o cliente!*`;

    // Envia para seu WhatsApp via Z-API ou Evolution API
    // Se você não tem ainda, a mensagem é logada no console do Vercel
    const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE;
    const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
    const SEU_NUMERO = process.env.SEU_WHATSAPP; // ex: 5537991282536

    if (ZAPI_INSTANCE && ZAPI_TOKEN && SEU_NUMERO) {
      await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: SEU_NUMERO,
          message: msg
        })
      });
    } else {
      // Fallback: loga no console do Vercel (você vê em tempo real no dashboard)
      console.log('=== NOVO PEDIDO PAGO ===');
      console.log(msg);
      console.log('========================');
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Erro no webhook:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
