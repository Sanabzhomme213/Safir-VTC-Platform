# Safir VTC — Supabase Edge Functions

## Déploiement

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Lier au projet
supabase link --project-ref YOUR_PROJECT_REF

# 4. Ajouter les secrets
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM_EMAIL=noreply@safir-vtc.fr
supabase secrets set RESEND_FROM_NAME="Safir VTC"

# 5. Déployer
supabase functions deploy ai-chat
supabase functions deploy send-email
```

## Fonctions disponibles

| Fonction | Description |
|---|---|
| `ai-chat` | Proxy Claude claude-opus-4-8 pour l'assistant IA |
| `send-email` | Envoi d'emails transactionnels via Resend |

## Secrets requis

| Secret | Source |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `RESEND_API_KEY` | resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Votre email vérifié sur Resend |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com (optionnel) |
