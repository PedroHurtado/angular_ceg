# Nueva Sintaxis de Templates en Angular

## Introducción

A partir de Angular 17, se introdujo una nueva sintaxis de control flow en los templates que reemplaza las directivas estructurales tradicionales (`*ngIf`, `*ngFor`, `*ngSwitch`). Esta nueva sintaxis ofrece mejor rendimiento, tipado más fuerte, y una experiencia de desarrollo más intuitiva.

## Ventajas de la Nueva Sintaxis

- **Mejor rendimiento**: Menor overhead en tiempo de ejecución
- **Sintaxis más legible**: Más cercana a JavaScript/TypeScript nativo
- **Mejor tipado**: Mejor inferencia de tipos en el editor
- **Menos imports**: No requiere importar directivas en componentes standalone
- **Detección de cambios optimizada**: Mejora automática en el change detection

---

## @if - Condicionales

### Sintaxis Básica

```typescript
@if (condicion) {
  <p>Este contenido se muestra si la condición es verdadera</p>
}
```

### Con @else

```typescript
@if (usuario.isLoggedIn) {
  <div class="welcome">
    <h2>Bienvenido, {{usuario.nombre}}</h2>
    <button (click)="logout()">Cerrar Sesión</button>
  </div>
} @else {
  <div class="login">
    <h2>Por favor, inicia sesión</h2>
    <button (click)="login()">Iniciar Sesión</button>
  </div>
}
```

### Con @else if

```typescript
@if (usuario.rol === 'admin') {
  <app-admin-panel></app-admin-panel>
} @else if (usuario.rol === 'moderador') {
  <app-moderator-panel></app-moderator-panel>
} @else if (usuario.rol === 'usuario') {
  <app-user-panel></app-user-panel>
} @else {
  <app-guest-panel></app-guest-panel>
}
```

### Comparación con Sintaxis Antigua

**Antes:**
```html
<div *ngIf="isLoading; else content">
  Cargando...
</div>
<ng-template #content>
  <p>Contenido cargado</p>
</ng-template>
```

**Ahora:**
```typescript
@if (isLoading) {
  <div>Cargando...</div>
} @else {
  <p>Contenido cargado</p>
}
```

---

## @for - Bucles

### Sintaxis Básica

```typescript
@for (item of items; track item.id) {
  <li>{{item.nombre}}</li>
}
```

**Nota importante**: El `track` es obligatorio para optimizar el rendimiento. Ayuda a Angular a identificar qué elementos cambiaron.

### Con @empty

```typescript
@for (producto of productos; track producto.id) {
  <div class="producto-card">
    <h3>{{producto.nombre}}</h3>
    <p>{{producto.precio | currency}}</p>
  </div>
} @empty {
  <p>No hay productos disponibles</p>
}
```

### Variables de Contexto

Dentro de un `@for`, tienes acceso a variables especiales:

```typescript
@for (item of items; track item.id; let idx = $index, let f = $first, let l = $last) {
  <div [class.first]="f" [class.last]="l">
    {{idx + 1}}. {{item.nombre}}
  </div>
}
```

**Variables disponibles:**
- `$index` - índice actual (número)
- `$first` - true si es el primer elemento
- `$last` - true si es el último elemento
- `$even` - true si el índice es par
- `$odd` - true si el índice es impar
- `$count` - número total de elementos

### Ejemplo Completo

```typescript
@for (tarea of tareas; track tarea.id; let indice = $index) {
  <div class="tarea" [class.completada]="tarea.completada">
    <span class="numero">{{indice + 1}}</span>
    <span class="titulo">{{tarea.titulo}}</span>
    <button (click)="completar(tarea.id)">
      @if (tarea.completada) {
        ✓ Completada
      } @else {
        Marcar como completada
      }
    </button>
  </div>
} @empty {
  <div class="sin-tareas">
    <p>No tienes tareas pendientes</p>
    <button (click)="agregarTarea()">Agregar Primera Tarea</button>
  </div>
}
```

### Comparación con Sintaxis Antigua

**Antes:**
```html
<div *ngFor="let item of items; let i = index; trackBy: trackByFn">
  {{i}}. {{item.name}}
</div>
<div *ngIf="items.length === 0">
  No hay elementos
</div>
```

**Ahora:**
```typescript
@for (item of items; track item.id; let i = $index) {
  <div>{{i}}. {{item.name}}</div>
} @empty {
  <div>No hay elementos</div>
}
```

---

## @switch - Switch/Case

### Sintaxis Básica

```typescript
@switch (estado) {
  @case ('pendiente') {
    <span class="badge badge-warning">Pendiente</span>
  }
  @case ('en-proceso') {
    <span class="badge badge-info">En Proceso</span>
  }
  @case ('completado') {
    <span class="badge badge-success">Completado</span>
  }
  @default {
    <span class="badge badge-secondary">Desconocido</span>
  }
}
```

### Ejemplo con Componentes

```typescript
@switch (tipoVista) {
  @case ('lista') {
    <app-lista-view [datos]="datos"></app-lista-view>
  }
  @case ('cuadricula') {
    <app-grid-view [datos]="datos"></app-grid-view>
  }
  @case ('tabla') {
    <app-table-view [datos]="datos"></app-table-view>
  }
  @default {
    <app-lista-view [datos]="datos"></app-lista-view>
  }
}
```

### Comparación con Sintaxis Antigua

**Antes:**
```html
<div [ngSwitch]="estado">
  <span *ngSwitchCase="'pendiente'">Pendiente</span>
  <span *ngSwitchCase="'completado'">Completado</span>
  <span *ngSwitchDefault>Desconocido</span>
</div>
```

**Ahora:**
```typescript
@switch (estado) {
  @case ('pendiente') { <span>Pendiente</span> }
  @case ('completado') { <span>Completado</span> }
  @default { <span>Desconocido</span> }
}
```

---

## @defer - Carga Diferida (Lazy Loading)

`@defer` permite cargar componentes de forma diferida, mejorando el rendimiento inicial de la aplicación.

### Sintaxis Básica

```typescript
@defer {
  <app-componente-pesado></app-componente-pesado>
}
```

### Con Placeholder

```typescript
@defer {
  <app-grafico-complejo [datos]="datos"></app-grafico-complejo>
} @placeholder {
  <div class="skeleton">Cargando gráfico...</div>
}
```

### Con Loading

```typescript
@defer {
  <app-video-player [url]="videoUrl"></app-video-player>
} @loading {
  <div class="spinner">
    <mat-spinner></mat-spinner>
    <p>Cargando reproductor...</p>
  </div>
} @placeholder {
  <div class="placeholder-video">
    <p>Haz clic para cargar el video</p>
  </div>
}
```

### Con Error

```typescript
@defer {
  <app-datos-externos></app-datos-externos>
} @loading (minimum 2s) {
  <app-loading-spinner></app-loading-spinner>
} @error {
  <div class="error">
    <p>Error al cargar el componente</p>
    <button (click)="reintentar()">Reintentar</button>
  </div>
} @placeholder (minimum 500ms) {
  <div>Preparando contenido...</div>
}
```

### Triggers (Disparadores)

#### on idle
```typescript
@defer (on idle) {
  <app-contenido-secundario></app-contenido-secundario>
}
```

#### on viewport
```typescript
@defer (on viewport) {
  <app-imagen-grande [src]="imagenUrl"></app-imagen-grande>
} @placeholder {
  <div style="height: 400px; background: #f0f0f0;"></div>
}
```

#### on interaction
```typescript
@defer (on interaction) {
  <app-modal-ayuda></app-modal-ayuda>
} @placeholder {
  <button>Cargar ayuda</button>
}
```

#### on hover
```typescript
@defer (on hover) {
  <app-tooltip-detallado></app-tooltip-detallado>
} @placeholder {
  <span>Pasa el mouse para ver detalles</span>
}
```

#### on immediate
```typescript
@defer (on immediate) {
  <app-contenido></app-contenido>
}
```

#### on timer
```typescript
@defer (on timer(5s)) {
  <app-mensaje-promocional></app-mensaje-promocional>
}
```

#### when (condición)
```typescript
@defer (when mostrarContenido) {
  <app-contenido-condicional></app-contenido-condicional>
}
```

### Combinando Triggers

```typescript
@defer (on interaction; on timer(10s)) {
  <app-contenido></app-contenido>
} @placeholder {
  <button>Cargar ahora</button>
  <p>Se cargará automáticamente en 10 segundos</p>
}
```

---

## Ejemplos Prácticos Completos

### Ejemplo 1: Lista de Usuarios con Filtros

```typescript
// component.ts
export class UsuariosComponent {
  usuarios = signal<Usuario[]>([]);
  filtro = signal<string>('todos');
  cargando = signal<boolean>(true);

  usuariosFiltrados = computed(() => {
    const users = this.usuarios();
    const filter = this.filtro();
    
    @switch (filter) {
      @case ('activos') { return users.filter(u => u.activo); }
      @case ('inactivos') { return users.filter(u => !u.activo); }
      @default { return users; }
    }
  });
}
```

```typescript
// template
<div class="usuarios-container">
  <div class="filtros">
    <button (click)="filtro.set('todos')">Todos</button>
    <button (click)="filtro.set('activos')">Activos</button>
    <button (click)="filtro.set('inactivos')">Inactivos</button>
  </div>

  @if (cargando()) {
    <div class="loading">
      <mat-spinner></mat-spinner>
      <p>Cargando usuarios...</p>
    </div>
  } @else {
    @for (usuario of usuariosFiltrados(); track usuario.id) {
      <div class="usuario-card">
        <img [src]="usuario.avatar" [alt]="usuario.nombre">
        <div class="info">
          <h3>{{usuario.nombre}}</h3>
          <p>{{usuario.email}}</p>
          @if (usuario.activo) {
            <span class="badge badge-success">Activo</span>
          } @else {
            <span class="badge badge-danger">Inactivo</span>
          }
        </div>
      </div>
    } @empty {
      <div class="sin-resultados">
        <p>No se encontraron usuarios</p>
        @if (filtro() !== 'todos') {
          <button (click)="filtro.set('todos')">Ver todos</button>
        }
      </div>
    }
  }
</div>
```

### Ejemplo 2: Dashboard con Carga Diferida

```typescript
<div class="dashboard">
  <h1>Panel de Control</h1>

  <!-- Contenido crítico que se carga inmediatamente -->
  <app-header></app-header>
  <app-resumen-rapido></app-resumen-rapido>

  <!-- Gráficos pesados con carga diferida -->
  @defer (on viewport) {
    <div class="graficos">
      <app-grafico-ventas></app-grafico-ventas>
      <app-grafico-usuarios></app-grafico-usuarios>
    </div>
  } @loading (minimum 1s) {
    <div class="skeleton-graficos">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  } @placeholder {
    <div class="placeholder-graficos">
      <p>Los gráficos se cargarán cuando hagas scroll</p>
    </div>
  }

  <!-- Tabla de datos con interacción -->
  @defer (on interaction) {
    <app-tabla-detallada [datos]="datosCompletos"></app-tabla-detallada>
  } @placeholder {
    <button class="btn-cargar">
      Ver tabla detallada
    </button>
  }
</div>
```

### Ejemplo 3: Carrito de Compras

```typescript
<div class="carrito">
  <h2>Tu Carrito</h2>

  @if (items().length > 0) {
    <div class="items-lista">
      @for (item of items(); track item.id; let idx = $index) {
        <div class="item" [class.ultimo]="$last">
          <img [src]="item.imagen" [alt]="item.nombre">
          <div class="detalles">
            <h4>{{item.nombre}}</h4>
            <p>{{item.precio | currency}}</p>
            <div class="cantidad">
              <button (click)="decrementar(item.id)">-</button>
              <span>{{item.cantidad}}</span>
              <button (click)="incrementar(item.id)">+</button>
            </div>
          </div>
          <button class="eliminar" (click)="eliminar(item.id)">
            🗑️
          </button>
        </div>
      } 
    </div>

    <div class="resumen">
      <div class="linea">
        <span>Subtotal:</span>
        <span>{{subtotal() | currency}}</span>
      </div>
      <div class="linea">
        <span>Envío:</span>
        <span>{{envio() | currency}}</span>
      </div>
      <div class="linea total">
        <strong>Total:</strong>
        <strong>{{total() | currency}}</strong>
      </div>
      <button class="btn-comprar" (click)="procederCompra()">
        Proceder al Pago
      </button>
    </div>
  } @else {
    <div class="carrito-vacio">
      <img src="assets/carrito-vacio.svg" alt="Carrito vacío">
      <h3>Tu carrito está vacío</h3>
      <p>Agrega productos para comenzar tu compra</p>
      <button (click)="irATienda()">Explorar Productos</button>
    </div>
  }
</div>
```

---

## Migración desde Sintaxis Antigua

### Tabla de Equivalencias

| Antigua | Nueva |
|---------|-------|
| `*ngIf` | `@if` |
| `*ngFor` | `@for` |
| `*ngSwitch` | `@switch` |
| `ng-template` | `@defer` (en muchos casos) |

### Herramienta de Migración Automática

Angular CLI ofrece una herramienta para migrar automáticamente:

```bash
ng generate @angular/core:control-flow
```

Esta herramienta convertirá automáticamente tu código de la sintaxis antigua a la nueva.

---

## Mejores Prácticas

### 1. Usa siempre `track` en @for
```typescript
// ✅ Correcto
@for (item of items; track item.id) { }

// ❌ Incorrecto (aunque funcione)
@for (item of items; track $index) { }
```

### 2. Combina @defer con estrategias apropiadas
```typescript
// Para contenido below the fold
@defer (on viewport) { }

// Para contenido interactivo
@defer (on interaction) { }

// Para contenido no crítico
@defer (on idle) { }
```

### 3. Usa @empty para mejor UX
```typescript
@for (item of items; track item.id) {
  <app-item [data]="item"></app-item>
} @empty {
  <app-estado-vacio></app-estado-vacio>
}
```

### 4. Mantén la lógica simple en templates
```typescript
// ✅ Correcto
@if (esVisible) { }

// ❌ Evita lógica compleja
@if (usuario && usuario.roles && usuario.roles.includes('admin')) { }

// ✅ Mejor: mueve la lógica al componente
@if (esAdmin) { }
```

---

## Conclusión

La nueva sintaxis de control flow de Angular ofrece:

- **Mejor rendimiento** gracias a la optimización en tiempo de compilación
- **Código más limpio** y fácil de leer
- **Mejor experiencia de desarrollo** con mejor autocompletado y detección de errores
- **Menos boilerplate** al no necesitar imports adicionales

Es recomendable adoptar esta sintaxis en proyectos nuevos y migrar gradualmente proyectos existentes para aprovechar sus beneficios.

---

## Referencias

- [Documentación oficial de Angular](https://angular.dev/guide/templates/control-flow)
- [Angular Blog - Announcing Angular 17](https://blog.angular.io/introducing-angular-v17-4d7033312e4b)
- [RFC de Control Flow](https://github.com/angular/angular/discussions/50719)