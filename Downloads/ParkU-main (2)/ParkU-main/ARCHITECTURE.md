# 🏗️ Arquitectura del Sistema ParkU - Guía Completa

## 📦 Resumen Ejecutivo

Todos los módulos están **100% conectados** a través de un **DataContext centralizado**. Cualquier acción en un módulo se refleja automáticamente en los demás.

### ✅ Estado Actual del Sistema
- ✅ Dashboard con datos REALES de usuarios, vehículos y parqueaderos
- ✅ Reservar celda en Parqueaderos → Aparece en Reservas automáticamente
- ✅ Reportar incidente en Parqueaderos → Aparece en Incidentes automáticamente
- ✅ Todos los módulos comparten la misma base de datos (DataContext)

---

## 🔌 Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    DataContext.tsx                          │
│              (Estado Global Centralizado)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Parqueaderos    • Celdas         • Vehículos           │
│  • Conductores     • Usuarios       • Roles               │
│  • Reservas        • Incidentes     • Asignaciones        │
│  • ControlSalida   • Movimientos                          │
│                                                             │
└────────────────┬──────────────────────────────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    ┌────────┐ ┌────────┐ ┌────────────┐
    │Dashboard│ │Parquea-│ │ Reservas   │
    │         │ │deros   │ │            │
    │(Lectura)│ │(CRUD+) │ │  (CRUD)    │
    └────────┘ └────────┘ └────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │Incidentes│ │ Control  │ │Asignacio-│
    │  (CRUD)  │ │ Salida   │ │nes(CRUD) │
    │          │ │ (CRUD)   │ │          │
    └──────────┘ └──────────┘ └──────────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐ ┌────────┐ ┌──────────┐
    │Usuarios│ │Roles   │ │Conductores
    │(CRUD)  │ │(CRUD)  │ │  (CRUD)
    └────────┘ └────────┘ └──────────┘
        │            │            │
        │            │            ▼
        │            │        ┌──────────┐
        │            │        │Vehiculos │
        │            │        │  (CRUD)  │
        │            │        └──────────┘
        └────────────┼────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  Celdas      │
              │  (CRUD)      │
              └──────────────┘
```

---

## 🔄 Flujos de Datos Principales

### 1️⃣ Crear Reserva (Parqueaderos → Reservas)

```
Usuario en Parqueaderos.tsx
    ↓
Click "Reservar Celda" → Abre Modal
    ↓
Completa: Vehículo, Horario, Celda, Fecha
    ↓
Click "Crear Reserva"
    ↓
handleCrearReserva() ejecuta:
    • Valida horarios
    • Detecta conflictos
    ↓
addReserva({
    vehiculoId: "v1",
    celdaId: "c0",
    fechaReserva: "2026-07-10",
    horaInicio: "08:00",
    horaFin: "18:00",
    estado: "pendiente"
})
    ↓
DataContext actualiza setReservas()
    ↓
Componente Reservas.tsx se re-renderiza
    ↓
Nueva reserva aparece en tabla de Reservas ✅
```

---

### 2️⃣ Reportar Incidente (Parqueaderos → Incidentes)

```
Usuario en Parqueaderos.tsx
    ↓
Click "Reportar Incidente" en una celda
    ↓
Abre Modal de Incidente
    ↓
Completa:
    • Descripción
    • Asignado a (opcional)
    • Notas resolución (opcional)
    ↓
Click "Registrar Incidente"
    ↓
registrarIncidente() ejecuta:
    • Valida descripción obligatoria
    ↓
addIncidente({
    descripcion: "Vehículo mal estacionado",
    parqueaderoId: "1",
    celdaId: "c0",
    vehiculo: "ABC123",
    conductor: "Carlos López",
    fecha: "2026-07-07T14:30:00Z",
    estado: "pendiente",
    asignadoA: "Juan Pérez"
})
    ↓
DataContext actualiza setIncidentes()
    ↓
Componente Incidentes.tsx se re-renderiza
    ↓
Nuevo incidente aparece en tabla de Incidentes ✅
```

---

### 3️⃣ Dashboard Datos Reales

```
Dashboard.tsx carga
    ↓
useData() obtiene:
    • parqueaderos, celdas, movimientos
    • vehiculos, conductores
    ↓
Mapea parqueaderos a ParkingLot:
    • Cuenta celdas por estado
    • Calcula % ocupación
    • Determina tipo (car/moto/mixed)
    ↓
Mapea conductores:
    • Cuenta por tipo (docente/admin/visitante)
    ↓
Mapea vehículos:
    • Cuenta automóviles vs motos
    ↓
Visualiza:
    • Ocupación en tiempo real ✅
    • Distribución de usuarios reales ✅
    • Vehículos reales ✅
    • Últimos movimientos reales ✅
```

---

## 📊 Matriz de Módulos

| Módulo | Importa | Escribe | Acción |
|--------|---------|---------|--------|
| 🏠 **Dashboard** | `useData()` | - | Visualiza estado general |
| 🏢 **Parqueaderos** | `useData()` | Reservas, Incidentes | Crea reservas/incidentes |
| 📅 **Reservas** | `useData()` | Reservas | Gestiona reservas |
| ⚠️ **Incidentes** | `useData()` | Incidentes | Gestiona incidentes |
| 📍 **ControlSalida** | `useData()` | ControlSalida | Entrada/Salida |
| 📋 **Asignaciones** | `useData()` | Asignaciones | Asigna celdas |
| 👥 **Usuarios** | `useData()` | Usuarios | Gestiona usuarios |
| 🔐 **Roles** | `useData()` | Roles | Gestiona roles |
| 🚗 **Conductores** | `useData()` | Conductores | Gestiona conductores |
| 🚙 **Vehículos** | `useData()` | Vehículos | Gestiona vehículos |
| 🅿️ **Celdas** | `useData()` | Celdas | Gestiona celdas |

---

## 🎯 Tipo de Datos Compartidos

### Entidades Centrales

```typescript
interface Parqueadero {
  id: string;
  nombre: string;
  direccion: string;
  capacity: number;
  estado: 'activo' | 'inactivo';
  // ...más campos
}

interface Celda {
  id: string;
  parqueaderoId: string;  // ← Vinculado a Parqueadero
  numero: string;
  tipo: 'carro' | 'moto' | 'movilidad reducida';
  estado: 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento';
  // ...
}

interface Reserva {
  id: string;
  vehiculoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
}

interface Incidente {
  id: string;
  descripcion: string;
  parqueaderoId: string;
  celdaId?: string;
  vehiculo?: string;
  fecha: string;
  estado: 'pendiente' | 'resuelto';
  asignadoA?: string;
}

interface Vehiculo {
  id: string;
  conductorId: string;
  placa: string;
  tipo: 'carro' | 'moto';
  // ...
}

interface Conductor {
  id: string;
  usuarioId: string;
  nombre: string;
  tipo: 'docente' | 'administrativo' | 'visitante';
  // ...
}
```

---

## 🔐 Validaciones Compartidas

### Conflictos de Reservas
```typescript
// Detecta si hay solapamiento de horarios
const conflicto = reservas.find(r => {
  if (r.celdaId !== nuevoFormulario.celdaId) return false;
  if (r.fechaReserva !== nuevoFormulario.fechaReserva) return false;
  
  const rInicio = toMinutes(r.horaInicio);
  const rFin = toMinutes(r.horaFin);
  const inicio = toMinutes(nuevoFormulario.horaInicio);
  const fin = toMinutes(nuevoFormulario.horaFin);
  
  return inicio < rFin && fin > rInicio; // ← Hay conflicto
});
```

### Validaciones de Incidentes
```typescript
// Incidentes requieren:
- Descripción (obligatoria)
- Parqueadero (obligatorio)
- Celda (opcional pero recomendado)
- Asignado a (opcional)
- Notas de resolución (opcional)
```

---

## 🚀 Cómo Funciona useData()

```typescript
// En cualquier componente:
const { 
  parqueaderos, addParqueadero, updateParqueadero, deleteParqueadero,
  celdas, addCelda, updateCelda, deleteCelda,
  reservas, addReserva, updateReserva, deleteReserva,
  incidentes, addIncidente, updateIncidente, deleteIncidente,
  // ... más entidades
} = useData();

// Leer datos
const miReserva = reservas.find(r => r.id === "123");

// Crear
addReserva({ vehiculoId, celdaId, ... });

// Actualizar
updateReserva(id, { estado: 'resuelto' });

// Eliminar
deleteReserva(id);
```

---

## ✨ Mejoras Realizadas

### Esta Sesión
- ✅ Dashboard ahora usa datos REALES del contexto
- ✅ Parqueaderos conectado a Reservas (crear → aparece en Reservas)
- ✅ Parqueaderos conectado a Incidentes (reportar → aparece en Incidentes)
- ✅ Verificación que todos los módulos usan `useData()`

### Sesión Anterior
- ✅ Agregado sistema de Incidentes al contexto
- ✅ Conexión Parqueaderos ↔ Incidentes
- ✅ Exportación de tipo Incidente desde contexto

---

## 🎓 Ejemplo Completo: Crear Reserva

### Código en Parqueaderos.tsx
```typescript
// 1. Obtener addReserva del contexto
const { ..., addReserva, reservas, ... } = useData();

// 2. Validar
if (!reservaForm.vehiculoId) {
  setReservaError("Selecciona vehículo");
  return;
}

// 3. Buscar conflictos
const conflicto = reservas.find(r => {
  if (r.celdaId !== reservaForm.celdaId) return false;
  if (r.fechaReserva !== reservaForm.fechaReserva) return false;
  // ... lógica de detección
  return hayConflicto;
});

if (conflicto) {
  setReservaError("Celda ya reservada...");
  return;
}

// 4. Crear en contexto
const { parqueaderoId, ...payload } = reservaForm;
addReserva(payload);
toast.success("Reserva creada");
```

### Lo que Sucede Automáticamente
1. `addReserva()` actualiza el estado en DataContext
2. Todos los componentes que usan `reservas` se re-renderizan
3. `Reservas.tsx` automáticamente muestra la nueva reserva
4. `Dashboard.tsx` actualiza el count de reservas
5. ¡Sin necesidad de prop drilling o APIs! ✨

---

## 🔍 Debug: Verificar Conexiones

### En Browser Console
```javascript
// Ver estado del contexto
localStorage.getItem('parkingLots')
localStorage.getItem('movements')

// En Chrome DevTools:
// Components → DataProvider → props → value
```

### Verificar Módulo Está Conectado
```typescript
// En cualquier componente
export function MiModulo() {
  const data = useData();
  console.log('DataContext:', data);
  // Si lo ve, ¡está conectado!
}
```

---

## 📝 Convenciones

1. **IDs:** Generados con timestamp + random
2. **Fechas:** ISO 8601 format (YYYY-MM-DD)
3. **Estados:** Enums bien definidos (no strings libres)
4. **Tipos:** TypeScript strict mode
5. **Nombres:** Español en UI, inglés en código interno

---

## 🎯 Próximos Pasos Recomendados

1. **Base de Datos Real**
   - Migrar de localStorage a API/Database
   - Persistencia entre sesiones

2. **Autenticación**
   - Conectar roles a permisos reales
   - Restringir acciones por rol

3. **Notificaciones**
   - Alertas cuando se crea reserva
   - Alertas cuando se reporta incidente

4. **Reportes**
   - Genera reportes con datos reales
   - Exportar a PDF/Excel

5. **WebSockets**
   - Actualización en tiempo real
   - Multi-usuario sincronizado

---

## 📚 Archivos Clave

```
src/
├── app/
│   ├── context/
│   │   └── DataContext.tsx          ← Centro neurálgico
│   ├── pages/
│   │   ├── Dashboard.tsx            ← Usa datos reales ✅
│   │   ├── Parqueaderos.tsx         ← Crea reservas/incidentes ✅
│   │   ├── Reservas.tsx             ← Lee reservas ✅
│   │   ├── Incidentes.tsx           ← Lee incidentes ✅
│   │   ├── ControlSalida.tsx        ← CRUD ControlSalida ✅
│   │   ├── Asignaciones.tsx         ← CRUD Asignaciones ✅
│   │   ├── Usuarios.tsx             ← CRUD Usuarios ✅
│   │   ├── Roles.tsx                ← CRUD Roles ✅
│   │   ├── Conductores.tsx          ← CRUD Conductores ✅
│   │   ├── Vehiculos.tsx            ← CRUD Vehículos ✅
│   │   └── Celdas.tsx               ← CRUD Celdas ✅
│   └── App.tsx
└── main.tsx
```

---

## ✅ Estado Final

**🎉 SISTEMA COMPLETAMENTE INTERCONECTADO**

- Todo módulo puede leer de cualquier entidad ✅
- Todo módulo puede escribir en su entidad ✅
- Cambios se propagan automáticamente ✅
- Dashboard muestra datos REALES ✅
- Sin necesidad de sincronización manual ✅

---

*Documentación actualizada: 2026-07-07*
*Arquitectura: 100% conectada ✅*
