# V&G SISTEMA - Deployment Guide

## 🚀 OPCIÓN 1: Deploy a Railway + Vercel (Recomendado - Zero Cost)

### PASO 1: Preparar GitHub

```bash
# Verificar que el repo esté actualizado
cd /Users/samuel/Documents/V\&G
git status
git add .
git commit -m "Final deployment v1.0"
git push origin master
```

### PASO 2: Deploy Backend a Railway

1. **Crear cuenta en railway.app**
   - Ir a https://railway.app
   - Sign up con GitHub

2. **Crear nuevo proyecto**
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Seleccionar repo V&G
   - Seleccionar rama: master

3. **Agregar PostgreSQL**
   - En Railway dashboard
   - Add Service → PostgreSQL
   - Configurará automáticamente conexión

4. **Configurar variables de entorno**
   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=su_clave_segura_aqui_32_chars_min
   DB_HOST=${{ Prisma.databaseUrl }} (auto)
   DB_PORT=5432
   DB_NAME=${{ Prisma.databaseName }} (auto)
   DB_USER=${{ Prisma.databaseUser }} (auto)
   DB_PASSWORD=${{ Prisma.databasePassword }} (auto)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=su_email@gmail.com
   SMTP_PASSWORD=app_password_aqui
   ```

5. **Railway deploy automático**
   - Railway detecta railway.json
   - Deploy inicia automáticamente
   - URL del backend: https://your-railway-url.railway.app

**Nota URL Backend**: Copiar URL cuando Railway termine deployment

### PASO 3: Deploy Frontend a Vercel

1. **Crear cuenta en vercel.com**
   - Ir a https://vercel.com
   - Sign up con GitHub

2. **Importar proyecto**
   - Click "New Project"
   - "Import Git Repository"
   - Seleccionar repo V&G
   - Framework Preset: Vite
   - Build command: `npm run build`
   - Output directory: `app/dist`

3. **Configurar variables de entorno**
   ```
   VITE_API_BASE_URL=https://your-railway-url.railway.app/api
   ```
   (Reemplazar con URL real de Railway)

4. **Deploy**
   - Vercel detecta vercel.json
   - Build inicia automáticamente
   - URL del frontend: https://your-vg-app.vercel.app

---

## 🔧 PASO 4: Setup de Base de Datos

Railway ejecutará migración automáticamente al detectar `migrations/001_initial_schema.sql`

Si necesita manual:
```sql
-- Ejecutar en Railway PostgreSQL
-- Via Railway dashboard → PostgreSQL → Connect → Run Query
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  rol VARCHAR(50),
  creado_en TIMESTAMP DEFAULT NOW()
);

-- ... resto de tablas
```

---

## ✅ Verificar Deployment

### Backend Verificación
```bash
curl https://your-railway-url.railway.app/api/health
# Respuesta esperada: {"status":"OK","message":"V&G API is running"}
```

### Frontend Verificación
- Ir a https://your-vg-app.vercel.app
- Debería verse página login
- Intentar login
- Si funciona: ¡Deployment exitoso! ✅

---

## 🔄 OPCIÓN 2: Deploy Manual a VPS (si lo prefiere)

### Backend VPS
```bash
# En tu VPS:
git clone https://github.com/tu_usuario/vg-sistema.git
cd vg-sistema/api
npm install --production
# Configurar .env
# Instalar PM2: npm install -g pm2
pm2 start index.js --name "vg-api"
pm2 startup
pm2 save
```

### Frontend VPS
```bash
cd vg-sistema/app
npm install --production
npm run build
# Servir con Nginx
# O: npm install -g serve && serve -s dist
```

---

## 🔐 Checklist Pre-Producción

- [ ] JWT_SECRET es string seguro (32+ chars)
- [ ] DB backup programado (Railway automático)
- [ ] CORS configurado solo para dominio
- [ ] Rate limiting activado
- [ ] Logs monitoreados
- [ ] SSL certificado (Vercel/Railway automático)
- [ ] Email notifications funcionando
- [ ] Admin usuario creado
- [ ] Prueba de login funciona
- [ ] Dashboard muestra datos

---

## 📊 Monitoreo Post-Deploy

### Railway Logs
```bash
railway logs
# O en dashboard: Deployments → Logs
```

### Vercel Analytics
```bash
vercel env ls
# O en dashboard: Analytics
```

### Database
```sql
-- Ver tamaño
SELECT pg_size_pretty(pg_database_size('vg_db'));

-- Ver usuarios
SELECT COUNT(*) FROM usuarios;

-- Ver gastos últimas 24h
SELECT COUNT(*) FROM gastos WHERE fecha >= NOW() - INTERVAL '24 hours';
```

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Verificar DB_HOST, DB_USER, DB_PASSWORD
- Railway → PostgreSQL → Connect
- Copiar credenciales completas

### "API no responde"
- railway logs
- Ver si hay errores en logs
- Verificar JWT_SECRET no vacío

### "Frontend error 404"
- Verificar VITE_API_BASE_URL correcto
- Verificar no tiene slash al final
- Vercel → Deployments → Logs

---

## 📝 URLs Finales

Después de deploy:
- **Frontend**: https://your-vg-app.vercel.app
- **Backend**: https://your-railway-url.railway.app/api
- **Database**: Railway PostgreSQL (interno)

---

## 💰 Costo

- **Railway**: Gratuito (5GB/mes) → $5/mes si excede
- **Vercel**: Gratuito (10GB bandwidth) → $20/mes si excede
- **Total**: $0 (o $5-25/mes si necesita más)
