# PLAN DE IMPLEMENTACIÓN - V&G Sistema de Control

## Módulos Requeridos (según PDF)

### ✅ COMPLETADOS
- [x] Autenticación JWT
- [x] ABM Máquinas (CRUD básico)
- [x] ABM Operarios (CRUD básico)
- [x] ABM Ubicaciones (CRUD básico)
- [x] ABM Gastos (CRUD básico)
- [x] ABM Ingresos (CRUD básico)
- [x] ABM Asignaciones (CRUD básico)
- [x] Landing page branded
- [x] Login funcional

### ⏳ PENDIENTE - PRIORIDAD ALTA

#### 1. DASHBOARD (Inicio)
- [ ] KPI Cards: gasto hoy, gasto semana, gasto mes, ingresos mes, ganancia
- [ ] Tabla "Flota hoy": máquinas, operario, ubicación, estado
- [ ] Alertas: gastos pendientes, mantenimientos próximos, sin gastos hoy
- [ ] Gráficos: gastos por categoría (pie), ingresos vs gastos (line)

#### 2. NAVBAR + NAVEGACIÓN
- [ ] Navbar con logo V&G
- [ ] Menú lateral o top con enlaces a módulos
- [ ] Protección de rutas (redirigir a login si no hay token)
- [ ] Logout funcional
- [ ] Usuario actual mostrado

#### 3. MEJORAR LISTADOS (todos los módulos)
- [ ] Búsqueda y filtros
- [ ] Paginación
- [ ] Ordenamiento
- [ ] Editar inline o modal
- [ ] Eliminar (soft delete)

#### 4. MÁQUINAS - MEJORADO
- [ ] Ficha detallada con:
  - Operario actual
  - Ubicación actual
  - Histórico de asignaciones
  - Gastos acumulados
  - Ingresos generados
- [ ] Botón "Reasignar" (cambiar operario/ubicación, guardar fecha)
- [ ] Mapa o lista agrupada por ubicación

#### 5. GASTOS - FUNCIONAL
- [ ] Formulario para registrar (manual)
- [ ] Categorías sugeridas
- [ ] Vista "Gastos del día" (por operario, por máquina)
- [ ] Estado: pendiente, aprobado, anulado
- [ ] Aprobar/rechazar gastos (admin)

#### 6. INGRESOS - FUNCIONAL
- [ ] Registrar facturación
- [ ] Cliente, máquina, ubicación
- [ ] Estado cobro: pendiente, cobrado, parcial
- [ ] Necesario para calcular ganancias

#### 7. NÓMINA - BÁSICA
- [ ] Ficha operario con:
  - Máquina/camión a cargo
  - Tipo de pago (diario, semanal, quincenal, mensual)
  - Monto
- [ ] Registro de pagos realizados
- [ ] Resumen por período

#### 8. ASIGNACIONES - MEJORADO
- [ ] Histórico completo de quién tuvo cada máquina
- [ ] Fechas de inicio/fin
- [ ] Reasignación desde máquina detail

#### 9. REPORTES (Fase 2)
- [ ] Semanal (domingo): resumen por máquina
- [ ] Generación automática (cron jobs - ya existe)
- [ ] Descarga PDF/Excel

#### 10. ANÁLISIS FINANCIERO (Fase 2)
- [ ] Tablero mensual: ingresos, gastos, nómina, ganancia
- [ ] Comparación con meses anteriores
- [ ] Rentabilidad por máquina, cliente, ubicación
- [ ] Reporte PDF/Excel descargable

## Stack Actual
- Frontend: React 18 + Vite + Tailwind + Zustand
- Backend: Node.js + Express + PostgreSQL
- Deployment: Vercel + Render

## Próximos Pasos (en orden)
1. Dashboard con KPIs y datos reales
2. Navbar + navegación + protección rutas
3. Mejorar listados (búsqueda, filtros)
4. Gastos con aprobación
5. Ingresos funcional
6. Nómina básica
7. Reportes (semanal/mensual)
8. Análisis financiero
