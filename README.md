# Beauty Store

E-commerce de beleza com painel administrativo e vitrine pública.

## Estrutura

| Pasta | Descrição | Porta local |
|-------|-----------|-------------|
| `backend/` | API Node.js/Express | 3005 |
| `admin/` | Painel admin React | 5174 |
| `store/` | Vitrine pública React | 5173 |

## Rodar localmente

```bash
# Backend
cd backend && npm install && npm run dev

# Admin (outro terminal)
cd admin && npm install && npm run dev

# Vitrine (outro terminal)
cd store && npm install && npm run dev
```

## Deploy

### 1. Backend → Railway

1. Crie conta em railway.app
2. New Project → Deploy from GitHub → selecione este repositório
3. Selecione a pasta `backend` como Root Directory
4. Adicione as variáveis de ambiente (copie de `.env.example`):
   - `DATABASE_URL` — sua connection string do Neon
   - `JWT_SECRET` — 64 bytes aleatórios
   - `JWT_REFRESH_SECRET` — outros 64 bytes aleatórios
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` — URLs do Vercel (preencha após deploy do frontend)
5. Após deploy, copie a URL do Railway (ex: `https://beauty-backend.up.railway.app`)
6. No Railway Shell ou localmente: `npm run seed` para criar o admin

### 2. Admin → Vercel

1. Crie conta em vercel.com
2. New Project → selecione este repositório
3. Root Directory: `admin`
4. Adicione variável de ambiente:
   - `VITE_API_URL=https://beauty-backend.up.railway.app/api`
5. Deploy

### 3. Vitrine → Vercel

1. New Project → mesmo repositório
2. Root Directory: `store`
3. Adicione variável de ambiente:
   - `VITE_API_URL=https://beauty-backend.up.railway.app/api`
4. Deploy

### 4. Atualizar CORS

Após ter as URLs do Vercel, volte no Railway e atualize:
```
ALLOWED_ORIGINS=https://beauty-admin.vercel.app,https://beauty-store.vercel.app
```

## Credenciais padrão

Configuradas no `backend/.env` via `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
