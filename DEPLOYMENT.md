# Despliegue Gratuito - V&G Sistema de Control

## Stack Gratuito Recomendado ⭐

```
Frontend:    Vercel (gratis)
Backend:     Railway (gratis tier)
Database:    Railway PostgreSQL (incluido gratis)
```

---

## Opción Recomendada: Vercel + Railway

### Ventajas
- ✅ Totalmente gratuito
- ✅ Sin tarjeta de crédito
- ✅ Fácil de usar
- ✅ Buena performance

### Paso 1: Frontend en Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Desplegar
cd app
vercel

# 3. En Vercel dashboard, agregar variable:
# VITE_API_BASE_URL=https://backend-url.railway.app/api
```

### Paso 2: Base de Datos en Railway

1. Ir a https://railway.app
2. Crear cuenta (GitHub login)
3. Crear proyecto > PostgreSQL
4. Copiar credenciales

### Paso 3: Backend en Railway

```bash
# 1. En api/
cd api

# 2. Crear railway.json
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
EOF

# 3. Desplegar
vercel link
# O usar Railway CLI
```

---

## Alternativas Gratuitas

| Opción | Frontend | Backend | Database | Costo |
|--------|----------|---------|----------|--------|
| **Railway** | Vercel | Railway | Railway PG | $0 |
| **Render** | Vercel | Render | Neon | $0 |
| **Fly.io** | Vercel | Fly.io | Neon | $0 |
| **Netlify** | Netlify | Railway | Railway PG | $0 |

---

## Paso a Paso: Railway

### Backend Config para Railway

```javascript
// api/config/database.js
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 
  `postgres://user:pass@localhost:5432/vg_db`;

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }  // Railway requiere SSL
});

export default pool;
```

### Variables de Entorno en Railway

```
DB_HOST=... (o usar DATABASE_URL)
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=tu_secreto_aqui
NODE_ENV=production
```

---

## URLs Después del Despliegue

| Componente | URL |
|-----------|-----|
| Frontend | `https://app.vercel.app` |
| Backend | `https://backend.railway.app` |
| API Health | `https://backend.railway.app/api/health` |

---

## Limitaciones Tier Gratuito

- Railway: 500 MB memoria, 100 GB transferencia/mes
- Vercel: 100 GB ancho de banda/mes
- PostgreSQL: 3 GB almacenamiento

**Para V&G MVP es más que suficiente.**

---

## Monitoreo

- Railway Dashboard: Logs y métricas
- Vercel Dashboard: Analytics del frontend
- Ambos tienen alertas básicas

---

## Escalar Después (Pago)

Si crece:
- Railway Pro: $20/mes
- Vercel Pro: $20/mes
- Neon: $14/mes (database)

**Total: ~$50/mes si es necesario escalar**

---

## Checklist Despliegue

- [ ] Railway account
- [ ] PostgreSQL en Railway
- [ ] Schema migrado
- [ ] Backend en Railway
- [ ] Frontend en Vercel
- [ ] Variables configuradas
- [ ] URLs actualizadas
- [ ] SSL funcionando
- [ ] Health checks OK
