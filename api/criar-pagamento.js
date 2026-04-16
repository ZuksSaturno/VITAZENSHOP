// api/criar-pagamento.js
// Backend seguro — sua chave API nunca fica exposta no frontend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { itens, total, cliente, pagamento } = req.body;

  if (!itens || !total || !cliente?.nome || !cliente?.email || !cliente?.telefone) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const ABACATE_API_KEY = process.env.ABACATE_API_KEY;

  if (!ABACATE_API_KEY) {
    return res.status(500).json({ error: 'Chave API não configurada' });
  }

  // Monta descrição dos itens
  const descricao = itens.map(i => `${i.qty}x ${i.nome}`).join(', ');

  try {
    // Cria cobrança no AbacatePay
    const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        frequency: 'ONE_TIME',
        methods: pagamento === 'PIX' ? ['PIX'] : ['PIX', 'CREDIT_CARD'],
        products: itens.map(i => ({
          externalId: String(i.id),
          name: i.nome,
          description: i.descricao || i.nome,
          quantity: i.qty,
          price: Math.round(i.preco * 100) // em centavos
        })),
        returnUrl: `${process.env.SITE_URL || 'https://seusite.vercel.app'}/sucesso`,
        completionUrl: `${process.env.SITE_URL || 'https://seusite.vercel.app'}/sucesso`,
        customer: {
          name: cliente.nome,
          email: cliente.email,
          cellphone: cliente.telefone.replace(/\D/g, ''),
          taxId: cliente.cpf ? cliente.cpf.replace(/\D/g, '') : undefined
        },
        metadata: {
          endereco: cliente.endereco,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          cep: cliente.cep
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AbacatePay error:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao criar cobrança' });
    }

    return res.status(200).json({
      url: data.data?.url || data.url,
      id: data.data?.id || data.id
    });

  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno ao processar pagamento' });
  }
}
