# Instrucciones de Configuración - V&G Sistema de Control

## Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 12
- npm o yarn

## Instalación del Entorno

### 1. Clonar el Repositorio

```bash
cd /Users/samuel/Documents/V&G
```

### 2. Configurar Base de Datos

#### Opción A: PostgreSQL Local (Recomendado para desarrollo)

```bash
# Crear base de datos
createdb vg_db

# Ejecutar migraciones
psql -U postgres -d vg_db -f api/migrations/001_initial_schema.sql
```

#### Opción B: Docker

```bash
docker run -d \
  --name vg-postgres \
  -e POSTGRES_DB=vg_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

### 3. Configurar Backend

```bash
cd api

# Copiar archivo .env
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar servidor (desarrollo)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

Verificar conexión:
- Health check: `http://localhost:3000/api/health`
- DB test: `http://localhost:3000/api/db-test`

### 4. Configurar Frontend

```bash
cd ../app

# Copiar archivo .env
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar servidor (desarrollo)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Variables de Entorno

### Backend (`api/.env`)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vg_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

### Frontend (`app/.env`)

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Verificación de Conexión

1. **API**: Acceder a `http://localhost:3000/api/health`
   - Debe responder: `{"status":"OK","message":"V&G API is running"}`

2. **Frontend**: Acceder a `http://localhost:5173`
   - Debe mostrar el dashboard de bienvenida
   - API Status y Database Status deben estar en verde

## Próximos Pasos (Fase 1)

- [ ] Implementar autenticación (JWT)
- [ ] Crear endpoints ABM para Máquinas
- [ ] Crear endpoints ABM para Operarios
- [ ] Crear endpoints ABM para Ubicaciones
- [ ] Implementar módulo de Gastos
- [ ] Crear Dashboard principal

## Troubleshooting

### Error: "Cannot find module"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Error: "Database connection failed"
```bash
# Verificar que PostgreSQL está corriendo
# macOS:
brew services list

# Linux:
sudo service postgresql status
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
# Backend: PORT=3001
# Frontend: Configurar en vite.config.js
```

## Comandos Útiles

```bash
# Backend
npm run dev        # Iniciar en modo desarrollo
npm run start      # Iniciar en producción
npm test           # Ejecutar tests (aún no implementado)

# Frontend
npm run dev        # Iniciar dev server
npm run build      # Compilar para producción
npm run preview    # Ver build localmente
```

## Estructura del Proyecto

```
V&G/
├── api/                    # Backend Node.js
│   ├── config/
│   ├── controllers/        # (Por implementar)
│   ├── middleware/         # (Por implementar)
│   ├── migrations/         # SQL migrations
│   ├── models/             # (Por implementar)
│   ├── routes/             # (Por implementar)
│   ├── services/           # (Por implementar)
│   ├── index.js
│   └── package.json
│
├── app/                    # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # (Por implementar)
│   │   ├── pages/          # (Por implementar)
│   │   ├── hooks/          # (Por implementar)
│   │   ├── services/       # (Por implementar)
│   │   ├── store/          # (Por implementar)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── docs/                   # Documentación
├── .gitignore
├── README.md
└── SETUP.md               # Este archivo
```

## Notas de Desarrollo

- El backend usa Express.js con ES modules (`"type": "module"`)
- El frontend usa Vite + React 18
- TailwindCSS está configurado para estilos
- Pool de conexiones PostgreSQL en el backend
- CORS está habilitado para requests entre localhost:3000 y localhost:5173
