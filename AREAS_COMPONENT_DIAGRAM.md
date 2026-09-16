# 📊 Diagrama de Componentes - Gestión de Áreas

## Estructura Jerárquica

```
┌─────────────────────────────────────────────────────────────────┐
│                     📄 AreasPage (page.tsx)                      │
│                                                                   │
│  • Orquesta toda la lógica de areas                              │
│  • Maneja estado global (areas, loading, error)                  │
│  • Gestiona modales y flujos de CRUD                             │
└─────────────────┬──────────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────────┐
        │         │         │             │
        ▼         ▼         ▼             ▼
    ┌────────┐ ┌────────┐ ┌────────┐  ┌──────────┐
    │  Hooks │ │ Search │ │ Button │  │  Tables  │
    │ useAr- │ │ Input  │ │ Nueva  │  │ & Modals │
    │ eas()  │ │        │ │ Área   │  │          │
    └────────┘ └────────┘ └────────┘  └──────────┘
        │
        ├─────────────────────┬──────────────┐
        │                     │              │
        ▼                     ▼              ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
│   useAreas()     │ │ useAreasUI()     │ │ useAreasUI() │
│                  │ │                  │ │              │
│ • loadAreas()    │ │ • showModal      │ │ • Modal UI   │
│ • create()       │ │ • editingArea    │ │   State      │
│ • update()       │ │ • loading states │ │              │
│ • delete()       │ │                  │ │              │
│ • search filter  │ │                  │ │              │
└──────────────────┘ └──────────────────┘ └──────────────┘
        │
        │  areas, loading, error, page, search
        │  existingNames, setPage, setSearch
        │  handleCreate, handleUpdate, handleDelete
        │
        ▼
┌──────────────────────────────────────────┐
│      📊 AreaTable Component              │
│                                          │
│ Props:                                   │
│  • areas: PaginatedAreasResponse         │
│  • onEdit: (area) => void                │
│  • onDelete: (area) => void              │
│                                          │
│ Columnas:                                │
│  ✓ Nombre                                │
│  ✓ Descripción                           │
│  ✓ Tipo (🏢 Física / ☁️ Virtual)        │
│  ✓ Mesas (Contador)                      │
│  ✓ Estado (Activa/Inactiva)              │
│  ✓ Acciones (Editar/Eliminar)            │
└──────────────────────────────────────────┘
        │
        ├──────────────────────┬──────────────────┐
        │ onEdit(area)         │ onDelete(area)   │
        ▼                      ▼                  ▼
    ┌──────────────────┐  ┌──────────────────┐ ┌──────────────────┐
    │  FormModal       │  │  DeleteModal     │ │                  │
    │                  │  │                  │ │   openModal()    │
    │ (Edit Mode)      │  │                  │ │   deleteClick()  │
    │                  │  │                  │ │                  │
    └──────────────────┘  └──────────────────┘ └──────────────────┘
        │                      │
        ▼                      ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   AreaForm       │  │  DeleteModal     │
    │                  │  │                  │
    │ • name input     │  │ • Confirmación   │
    │ • description    │  │ • Loading state  │
    │ • isVirtual      │  │ • handleConfirm()│
    │   checkbox       │  │                  │
    │ • validation     │  │                  │
    │ • submit handler │  │                  │
    └──────────────────┘  └──────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                      💾 API Layer (lib/api/admin/areas.ts)            │
└──────────────────────────────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────────┐
        │          │          │              │
        ▼          ▼          ▼              ▼
    ┌────────┐ ┌────────┐ ┌────────┐  ┌──────────┐
    │ GET    │ │ POST   │ │ PATCH  │  │ DELETE   │
    │ /areas │ │ /areas │ │ /areas │  │ /areas   │
    │        │ │        │ │ /:id   │  │ /:id     │
    │(read)  │ │(create)│ │(update)│  │ (delete) │
    └────────┘ └────────┘ └────────┘  └──────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    📦 Data Models & Types                             │
└──────────────────────────────────────────────────────────────────────┘

┌─ AreaResponse ────────────────────────┐
│                                       │
│  id: string                           │
│  name: string                         │
│  description?: string                 │
│  isVirtual: boolean  ← NEW!           │
│  isActive: boolean                    │
│  tablesCount: number                  │
│  createdAt: Date                      │
│  updatedAt: Date                      │
│                                       │
└───────────────────────────────────────┘

┌─ CreateAreaPayload ────────────────────┐
│                                        │
│  name: string                          │
│  description?: string                  │
│  isVirtual?: boolean  ← NEW!           │
│                                        │
└────────────────────────────────────────┘

┌─ PaginatedAreasResponse ──────────────┐
│                                       │
│  data: AreaResponse[]                 │
│  total: number                        │
│  page: number                         │
│  limit: number                        │
│  pages: number                        │
│                                       │
└───────────────────────────────────────┘
```

---

## 🔄 Flujos de Datos

### 1️⃣ **Crear Nueva Área**

```
Usuario → Click "Nueva Área" Button
    │
    ▼
handleOpenModal() [useAreasUI]
    │
    ▼
showModal = true, editingArea = undefined
    │
    ▼
FormModal Rendered (Create Mode)
    │
    ├─→ AreaForm Component
    │    │
    │    ├─ name input
    │    ├─ description input
    │    └─ isVirtual checkbox ✨ NEW
    │
    ▼
User fills form & submits
    │
    ▼
handleSubmit() in page.tsx
    │
    ├─ validateForm()
    │
    ├─ handleCreate() [useAreas hook]
    │    │
    │    ├─ POST /api/areas
    │    │   {
    │    │     "name": "DELIVERY",
    │    │     "description": "Entregas a domicilio",
    │    │     "isVirtual": true
    │    │   }
    │    │
    │    ├─ Backend creates area
    │    │
    │    └─ Refresh areas list
    │
    ├─ handleCloseModal()
    │
    └─ Toast: "Area creada exitosamente"
```

### 2️⃣ **Editar Área Existente**

```
Usuario → Click "Editar" en tabla
    │
    ▼
onEdit(area) callback
    │
    ▼
handleOpenModal(area) [useAreasUI]
    │
    ▼
showModal = true, editingArea = area
    │
    ▼
FormModal Rendered (Edit Mode)
    │
    ├─→ AreaForm Component
    │    │
    │    ├─ Populate form with current values
    │    ├─ name: "EXTERIOR"
    │    ├─ description: "Área exterior del restaurante"
    │    └─ isVirtual: false
    │
    ▼
User updates & submits
    │
    ▼
handleSubmit() in page.tsx
    │
    ├─ validateForm()
    │
    ├─ handleUpdate() [useAreas hook]
    │    │
    │    ├─ PATCH /api/areas/:id
    │    │   {
    │    │     "name": "EXTERIOR",
    │    │     "description": "Área exterior actualizada",
    │    │     "isVirtual": false
    │    │   }
    │    │
    │    ├─ Backend updates area
    │    │
    │    └─ Refresh areas list
    │
    ├─ handleCloseModal()
    │
    └─ Toast: "Area actualizada exitosamente"
```

### 3️⃣ **Eliminar Área**

```
Usuario → Click "Eliminar" en tabla
    │
    ▼
onDelete(area) callback
    │
    ▼
handleDeleteClick(area) [useAreasUI]
    │
    ▼
showDeleteModal = true, deleteTarget = area
    │
    ▼
DeleteModal Rendered
    │
    ├─ Confirmación con nombre del área
    │ "¿Eliminar el área 'DELIVERY'?"
    │
    ▼
User confirms
    │
    ▼
handleConfirmDelete() in page.tsx
    │
    ├─ DELETE /api/areas/:id
    │
    ├─ Backend soft-deletes area
    │   (deletedAt = now())
    │
    ├─ Refresh areas list
    │
    ├─ setShowDeleteModal(false)
    │
    └─ Toast: "Area eliminada exitosamente"
```

### 4️⃣ **Búsqueda y Filtrado**

```
Usuario → Escribe en search input
    │
    ▼
setSearch(value)
    │
    ▼
useAreas Hook computes filtered results
    │
    ├─ Filtra: existingNames, areas
    │
    └─ Re-render AreaTable con resultados
```

---

## 🎨 Visual Components

### AreaTable - Columnas

```
┌────────────────────────────────────────────────────────────────────────┐
│ Nombre    │ Descripción │ Tipo           │ Mesas │ Estado   │ Acciones │
├────────────────────────────────────────────────────────────────────────┤
│ EXTERIOR  │ Área ext.   │ 🏢 Física      │  10   │ Activa   │ ✏️ 🗑️   │
│ SALON     │ Comedor     │ 🏢 Física      │   8   │ Activa   │ ✏️ 🗑️   │
│ DELIVERY  │ Entregas    │ ☁️ Virtual     │   0   │ Activa   │ ✏️ 🗑️   │
│ RECOGER   │ Para llevar │ ☁️ Virtual     │   0   │ Inactiva │ ✏️ 🗑️   │
└────────────────────────────────────────────────────────────────────────┘
```

### AreaForm - Campos

```
┌─────────────────────────────────────┐
│  ⬜ Nombre del Área                  │
│  "Área con este nombre ya existe"   │ ← Error validation
│                                     │
│  ⬜ Descripción                      │
│  "(Opcional)"                       │
│                                     │
│  ☑️ Marcar como área virtual        │
│  "Las áreas virtuales no tienen mesas"
│                                     │
│  [Cancelar]  [Guardar Área]         │
└─────────────────────────────────────┘
```

---

## 🏗️ State Management

### useAreas Hook
```typescript
{
  areas: AreaResponse[],
  loading: boolean,
  error: string | null,
  page: number,
  search: string,
  existingNames: Set<string>,
  
  setPage: (page: number) => void,
  setSearch: (search: string) => void,
  handleCreate: (payload: CreateAreaPayload) => Promise<void>,
  handleUpdate: (id: string, payload: CreateAreaPayload) => Promise<void>,
  handleDelete: (id: string, name: string) => Promise<void>,
}
```

### useAreasUI Hook
```typescript
{
  showModal: boolean,
  editingArea: AreaResponse | undefined,
  showDeleteModal: boolean,
  deleteTarget: AreaResponse | null,
  submitting: boolean,
  deleteSubmitting: boolean,
  
  handleOpenModal: (area?: AreaResponse) => void,
  handleCloseModal: () => void,
  handleDeleteClick: (area: AreaResponse) => void,
  setSubmitting: (bool: boolean) => void,
  setDeleteSubmitting: (bool: boolean) => void,
  setShowDeleteModal: (bool: boolean) => void,
  setDeleteTarget: (area: AreaResponse | null) => void,
}
```

### useAreasUI UI State
```typescript
{
  showModal: boolean,           // FormModal visible?
  editingArea: AreaResponse,    // Area being edited
  showDeleteModal: boolean,     // DeleteModal visible?
  deleteTarget: AreaResponse,   // Area being deleted
  submitting: boolean,          // Creating/updating?
  deleteSubmitting: boolean,    // Deleting?
}
```

---

## ✨ Features Implementadas

| Feature | Estado | Descripción |
|---------|--------|-------------|
| CRUD Básico | ✅ | Create, Read, Update, Delete areas |
| Búsqueda | ✅ | Filtrado por nombre |
| Paginación | ✅ | Soporte para múltiples páginas |
| Validación | ✅ | Nombres únicos, validaciones de form |
| Soft Delete | ✅ | Areas se marcan como deletedAt |
| isVirtual Flag | ✨ | Distinguir áreas físicas vs virtuales |
| Contador Mesas | ✅ | Muestra mesas asociadas a cada área |
| Estado Activa/Inactiva | ✅ | Control de disponibilidad |
| Dark Mode | ✅ | Full dark mode support |
| Modales UI | ✅ | FormModal + DeleteModal componentes |

---

## 🔗 Relaciones con Otros Sistemas

```
AreasPage (Frontend)
    │
    ├─→ AreaResponse (data model)
    │    └─→ Used in OrderDetailModal (serviceType display)
    │    └─→ Used in MesasNegocio (area selector sidebar)
    │
    ├─→ Order.serviceType
    │    └─→ = table.area.name (backend assigns automatically)
    │
    └─→ Table Model
         └─→ Each table has areaId foreign key
         └─→ Display: "Mesa 1 en área EXTERIOR"


Database Schema (Prisma):
    Area {
      id           String @id
      name         String @unique
      description  String?
      isVirtual    Boolean @default(false)  ← NEW!
      isActive     Boolean @default(true)
      createdAt    DateTime
      updatedAt    DateTime
      deletedAt    DateTime?  (Soft delete)
      
      // Relations
      tables       Table[]
      orders       Order[]
    }

    Table {
      areaId       String (foreign key)
      area         Area @relation(fields: [areaId])
      ...
    }

    Order {
      serviceType  String  // Derives from table.area.name
      ...
    }
```

---

## 📱 Responsive Design

```
Desktop (≥768px):
┌─────────────────────────────────────┐
│        Header + Search + Button      │
│                                     │
│     AreaTable (Full width)          │
│     ┌────────────────────────────┐  │
│     │ Nombre │ Desc │ Tipo │ ...│  │
│     │ ─────────────────────────  │  │
│     │ SALON  │ ...  │ 🏢   │ ...│  │
│     │ EXT    │ ...  │ 🏢   │ ...│  │
│     │ DELIV  │ ...  │ ☁️   │ ...│  │
│     └────────────────────────────┘  │
│                                     │
│           Pagination                 │
└─────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────┐
│ H + S + Button   │
│                  │
│ AreaTable        │
│ (Scroll horizontal)
│ ┌───────────────┐│
│ │ Name │ Type   ││
│ │ ────────────  ││
│ │ EXTR│ 🏢     ││
│ │ DELI│ ☁️     ││
│ └───────────────┘│
│                  │
└──────────────────┘
```

