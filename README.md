# VitaZen — Guia de Publicação no Vercel

## Estrutura do projeto

```
vitazen/
├── index.html          ← Loja completa
├── sucesso.html        ← Página pós-pagamento
├── vercel.json         ← Configuração do Vercel
├── api/
│   ├── criar-pagamento.js  ← Backend: cria cobrança no AbacatePay
│   └── webhook.js          ← Backend: recebe confirmação e avisa no WhatsApp
└── README.md
```

---

## Passo a passo para publicar

### 1. Suba o projeto no Vercel

1. Acesse https://vercel.com e faça login
2. Clique em **"Add New Project"**
3. Escolha **"Deploy from your computer"** ou suba via GitHub
4. Faça upload da pasta `vitazen/` inteira
5. Clique em **Deploy**

---

### 2. Configure as variáveis de ambiente (OBRIGATÓRIO)

Após o deploy, vá em:
**Settings → Environment Variables**

Adicione estas variáveis:

| Nome | Valor |
|------|-------|
| `ABACATE_API_KEY` | Sua chave da AbacatePay (a nova que você gerou) |
| `SITE_URL` | URL do seu site (ex: https://vitazen.vercel.app) |
| `SEU_WHATSAPP` | Seu número com DDI+DDD (ex: 5537991282536) |
| `ZAPI_INSTANCE` | ID da sua instância Z-API *(opcional por enquanto)* |
| `ZAPI_TOKEN` | Token da Z-API *(opcional por enquanto)* |

> ⚠️ NUNCA coloque sua chave API diretamente no código HTML.
> As variáveis de ambiente ficam seguras no servidor Vercel.

---

### 3. Configure o Webhook no AbacatePay

1. Acesse o painel da AbacatePay
2. Vá em **Configurações → Webhooks**
3. Adicione a URL: `https://SEU-SITE.vercel.app/api/webhook`
4. Selecione o evento: **Pagamento confirmado / PAID**
5. Salve

Agora toda vez que um pagamento for confirmado, o Vercel recebe o aviso e envia a mensagem no seu WhatsApp automaticamente.

---

### 4. Teste o fluxo

1. Acesse sua loja
2. Adicione produtos ao carrinho
3. Preencha os dados e clique em "Ir para o pagamento"
4. Você será redirecionado para a página de pagamento da AbacatePay
5. Após pagar, será redirecionado para `/sucesso`
6. Você receberá a mensagem no WhatsApp com todos os detalhes do pedido

---

### 5. WhatsApp automático (opcional — próximo passo)

Para receber as mensagens automaticamente no WhatsApp:
1. Crie uma conta em https://z-api.io
2. Conecte seu WhatsApp
3. Pegue o **Instance ID** e o **Token**
4. Adicione nas variáveis de ambiente do Vercel

---

## Suporte
Qualquer dúvida, consulte o agente VitaZen.
