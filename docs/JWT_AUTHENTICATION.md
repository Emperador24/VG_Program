# JWT Authentication - V&G Sistema de Control

**Estado**: ✅ Completado  
**Endpoints**: 5 implementados

## 🔐 Autenticación JWT

### Endpoints Implementados

```
POST   /api/auth/register        - Registrar usuario
POST   /api/auth/login            - Login (devuelve token)
POST   /api/auth/refresh          - Refrescar token (protegido)
POST   /api/auth/change-password  - Cambiar contraseña (protegido)
GET    /api/auth/me               - Obtener usuario actual (protegido)
```

### Ejemplo: Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@vg.com",
    "contraseña": "admin123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Admin",
    "correo": "admin@vg.com",
    "rol": "administracion",
    "activo": true
  }
}
```

### Usar Token en Requests

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🚀 Frontend

### Inicializar en App

```javascript
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { initialize } = useAuth();
  
  useEffect(() => {
    initialize();
  }, []);
}
```

### Login en Componente

```javascript
import { useAuth } from './hooks/useAuth';

const { login, error, loading } = useAuth();

const handleLogin = async (correo, contraseña) => {
  try {
    await login(correo, contraseña);
    navigate('/dashboard');
  } catch (err) {
    console.error(err);
  }
};
```

### Proteger Rutas

```javascript
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Dashboard />;
}
```

## 🔒 Seguridad

- ✅ Contraseñas con bcrypt (10 rounds)
- ✅ Tokens JWT con firma segura
- ✅ Expiración: 24h (configurable)
- ✅ Roles: administrador, administracion
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ CORS configurado

## 📦 Almacenamiento Local

```
localStorage:
- token: JWT token
- usuario: JSON del usuario
```

Se limpian automáticamente al logout.

## ⚙️ Config Requerida

**Backend** (`api/.env`):
```
JWT_SECRET=tu_secreto_aleatorio_aqui
JWT_EXPIRATION=24h
```

## 🎯 Próximo Paso

ABM Máquinas (usar autenticación existente)
