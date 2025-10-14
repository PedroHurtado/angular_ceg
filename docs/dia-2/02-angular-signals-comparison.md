# Comparativa: Señales vs Decoradores en Angular

## ¿Qué son las Señales (Signals)?

Las señales son un nuevo sistema de reactividad introducido en Angular 16+ que permite rastrear cambios de estado de forma más eficiente y granular que el sistema tradicional de detección de cambios basado en Zone.js.

**Beneficios principales:**
- Detección de cambios más eficiente y predecible
- Mejor rendimiento
- Código más reactivo y declarativo
- Mayor type-safety
- Posibilidad de eliminar Zone.js en el futuro

---

## Signal vs Zone.js: Sistemas de Reactividad

### Zone.js (Sistema Tradicional)

**¿Cómo funciona?**
- Zone.js "parchea" todas las APIs asíncronas del navegador (setTimeout, eventos, HTTP, etc.)
- Ejecuta detección de cambios en todo el árbol de componentes
- No sabe qué cambió específicamente, revisa todo

```typescript
@Component({
  selector: 'app-ejemplo',
  template: `
    <p>{{ contador }}</p>
    <button (click)="incrementar()">+1</button>
  `
})
export class EjemploComponent {
  contador = 0;
  
  incrementar() {
    this.contador++; // Zone.js detecta esto y ejecuta CD en toda la app
  }
}
```

**Problemas de Zone.js:**
- ❌ Detección de cambios excesiva (chequea componentes que no cambiaron)
- ❌ Difícil de predecir cuándo se ejecuta
- ❌ Impacto en el rendimiento con aplicaciones grandes
- ❌ Aumenta el tamaño del bundle (~40KB)
- ❌ Dificulta el debugging

### Signals (Sistema Nuevo)

**¿Cómo funciona?**
- Detección de cambios granular: solo actualiza lo que realmente cambió
- El grafo de dependencias es explícito y rastreable
- No necesita "parchear" APIs del navegador

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `
    <p>{{ contador() }}</p>
    <button (click)="incrementar()">+1</button>
  `
})
export class EjemploComponent {
  contador = signal(0);
  
  incrementar() {
    this.contador.set(this.contador() + 1);
    // Solo se actualiza este componente específicamente
  }
}
```

**Ventajas de Signals:**
- ✅ Detección de cambios quirúrgica (solo lo necesario)
- ✅ Comportamiento predecible y rastreable
- ✅ Mejor rendimiento (especialmente en apps grandes)
- ✅ Permite eventualmente eliminar Zone.js
- ✅ Tamaño de bundle más pequeño
- ✅ Debugging más fácil

### Tabla Comparativa

| Característica | Zone.js | Signals |
|---------------|---------|---------|
| **Detección de cambios** | Global (todo el árbol) | Granular (solo lo necesario) |
| **Rendimiento** | Puede ser lento en apps grandes | Más eficiente |
| **Predictibilidad** | Difícil de predecir | Completamente predecible |
| **Tamaño bundle** | +40KB | Mínimo |
| **Debugging** | Complejo | Más simple |
| **Reactividad** | Implícita | Explícita |

---

## Signal: El Core del Sistema

### ¿Qué es un Signal?

Un `signal` es un contenedor reactivo de un valor que notifica a los consumidores cuando cambia.

### Creación y Uso Básico

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `
    <div>
      <p>Contador: {{ contador() }}</p>
      <p>Nombre: {{ nombre() }}</p>
      <button (click)="incrementar()">Incrementar</button>
      <button (click)="cambiarNombre()">Cambiar Nombre</button>
    </div>
  `
})
export class EjemploComponent {
  // Crear signals
  contador = signal(0);
  nombre = signal('Angular');
  
  // Leer valor: usar ()
  leerValor() {
    console.log(this.contador()); // 0
  }
  
  // Actualizar valor: usar set()
  incrementar() {
    this.contador.set(this.contador() + 1);
  }
  
  // Actualizar basado en valor anterior: usar update()
  cambiarNombre() {
    this.nombre.update(valor => valor + '!');
  }
  
  // Mutar objetos/arrays (solo si es necesario)
  mutarObjeto() {
    this.contador.mutate(value => {
      // Para objetos complejos
      // value.propiedad = nuevoValor;
    });
  }
}
```

### Métodos de Signal

```typescript
const miSignal = signal(10);

// 1. set() - Establece un nuevo valor
miSignal.set(20);

// 2. update() - Actualiza basado en el valor anterior
miSignal.update(valor => valor + 5);

// 3. mutate() - Para objetos/arrays complejos
const lista = signal([1, 2, 3]);
lista.mutate(array => array.push(4));

// 4. () - Leer el valor
console.log(miSignal()); // 25
```

### Computed Signals - Vista Previa

Señales derivadas que se recalculan automáticamente cuando sus dependencias cambian.

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-carrito',
  template: `
    <div>
      <p>Precio: ${{ precio() }}</p>
      <p>Cantidad: {{ cantidad() }}</p>
      <p>Total: ${{ total() }}</p>
      <p>IVA (21%): ${{ totalConIVA() }}</p>
    </div>
  `
})
export class CarritoComponent {
  precio = signal(100);
  cantidad = signal(2);
  
  // Computed: se recalcula automáticamente
  total = computed(() => this.precio() * this.cantidad());
  
  // Computed anidado
  totalConIVA = computed(() => this.total() * 1.21);
  
  // El computed SOLO se recalcula cuando precio o cantidad cambian
  // No se ejecuta innecesariamente
}
```

**Características de computed:**
- 📝 Solo lectura (no se puede modificar directamente)
- 🔄 Se recalcula automáticamente cuando cambian sus dependencias
- 💾 Memorización: solo recalcula si las dependencias cambiaron
- ⚡ Lazy evaluation: solo se calcula cuando se lee

**Nota:** Más adelante encontrarás una sección completa dedicada a `computed` con ejemplos avanzados.

---

## Effect: Efectos Secundarios Reactivos

### ¿Qué es un Effect?

Un `effect` es una función que se ejecuta automáticamente cuando las señales que lee cambian. Se usa para efectos secundarios (side effects) como logging, llamadas API, sincronización con localStorage, etc.

### Uso Básico

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `
    <div>
      <input [value]="busqueda()" 
             (input)="busqueda.set($any($event.target).value)">
      <p>{{ resultados() }}</p>
    </div>
  `
})
export class EjemploComponent {
  busqueda = signal('');
  resultados = signal<string[]>([]);
  
  constructor() {
    // Effect básico: se ejecuta cuando busqueda() cambia
    effect(() => {
      console.log('Búsqueda cambió a:', this.busqueda());
    });
    
    // Effect para localStorage
    effect(() => {
      localStorage.setItem('busqueda', this.busqueda());
    });
    
    // Effect para llamadas API
    effect(() => {
      const termino = this.busqueda();
      if (termino.length > 2) {
        // Llamada API
        this.buscarEnAPI(termino);
      }
    });
  }
  
  buscarEnAPI(termino: string) {
    // Lógica de búsqueda
  }
}
```

### Effect con Cleanup

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-temporizador'
})
export class TemporizadorComponent {
  activo = signal(true);
  
  constructor() {
    effect((onCleanup) => {
      if (this.activo()) {
        const interval = setInterval(() => {
          console.log('Tick...');
        }, 1000);
        
        // Cleanup: se ejecuta cuando el effect se vuelve a ejecutar
        // o cuando el componente se destruye
        onCleanup(() => {
          clearInterval(interval);
          console.log('Intervalo limpiado');
        });
      }
    });
  }
}
```

### Effect con Opciones

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-opciones'
})
export class OpcionesComponent {
  contador = signal(0);
  
  constructor() {
    // Effect que NO se ejecuta en la inicialización
    effect(() => {
      console.log('Contador:', this.contador());
    }, {
      allowSignalWrites: false, // No permite escribir signals dentro
      manualCleanup: false // Cleanup automático
    });
  }
}
```

### Cuándo usar Effect

**✅ Buenos casos de uso:**
- Logging y debugging
- Sincronización con localStorage/sessionStorage
- Iniciar llamadas HTTP cuando cambian datos
- Actualizar elementos del DOM fuera de Angular
- Integración con librerías de terceros
- Analytics y tracking

**❌ Evitar effect para:**
- Derivar estado (usa `computed` en su lugar)
- Actualizar otros signals (puede causar ciclos)
- Lógica de negocio principal
- Operaciones síncronas que podrían ser computed

---

## Computed: Señales Derivadas

### ¿Qué es Computed?

`computed` crea una señal de solo lectura cuyo valor se deriva de otras señales. Se recalcula automática y eficientemente cuando sus dependencias cambian.

### Características Principales

- **Solo lectura**: No puedes modificar directamente un computed
- **Memorización (Memoization)**: Solo recalcula si sus dependencias cambiaron
- **Lazy Evaluation**: Solo se calcula cuando se lee
- **Seguimiento automático**: Detecta automáticamente sus dependencias

### Ejemplos Básicos

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-ejemplos-computed',
  template: `
    <div>
      <h3>Ejemplo 1: Cálculos Simples</h3>
      <p>Nombre completo: {{ nombreCompleto() }}</p>
      
      <h3>Ejemplo 2: Carrito</h3>
      <p>Total: ${{ total() }}</p>
      <p>Con descuento: ${{ totalConDescuento() }}</p>
      
      <h3>Ejemplo 3: Filtrado</h3>
      <p>Activos: {{ productosActivos().length }}</p>
    </div>
  `
})
export class EjemplosComputedComponent {
  // === EJEMPLO 1: Concatenación ===
  nombre = signal('Juan');
  apellido = signal('Pérez');
  
  nombreCompleto = computed(() => 
    `${this.nombre()} ${this.apellido()}`
  );
  
  // === EJEMPLO 2: Cálculos Matemáticos ===
  precio = signal(100);
  cantidad = signal(3);
  descuento = signal(0.1); // 10%
  
  subtotal = computed(() => 
    this.precio() * this.cantidad()
  );
  
  total = computed(() => 
    this.subtotal()
  );
  
  totalConDescuento = computed(() => 
    this.total() * (1 - this.descuento())
  );
  
  // === EJEMPLO 3: Filtrado y Transformación ===
  productos = signal([
    { id: 1, nombre: 'Laptop', activo: true },
    { id: 2, nombre: 'Mouse', activo: false },
    { id: 3, nombre: 'Teclado', activo: true }
  ]);
  
  productosActivos = computed(() => 
    this.productos().filter(p => p.activo)
  );
}
```

### Ejemplos Avanzados

#### 1. Computed con Lógica Compleja

```typescript
import { Component, signal, computed } from '@angular/core';

interface Usuario {
  nombre: string;
  edad: number;
  rol: 'admin' | 'usuario' | 'invitado';
}

@Component({
  selector: 'app-permisos'
})
export class PermisosComponent {
  usuario = signal<Usuario>({
    nombre: 'Ana',
    edad: 25,
    rol: 'usuario'
  });
  
  // Computed con lógica condicional
  puedeEditar = computed(() => {
    const user = this.usuario();
    return user.rol === 'admin' || 
           (user.rol === 'usuario' && user.edad >= 18);
  });
  
  // Computed con múltiples condiciones
  nivelAcceso = computed(() => {
    const user = this.usuario();
    if (user.rol === 'admin') return 'completo';
    if (user.rol === 'usuario') return 'limitado';
    return 'solo-lectura';
  });
  
  // Computed que retorna objeto
  estadoUsuario = computed(() => ({
    nombre: this.usuario().nombre,
    acceso: this.nivelAcceso(),
    puedeEditar: this.puedeEditar(),
    timestamp: new Date()
  }));
}
```

#### 2. Computed Anidados

```typescript
@Component({
  selector: 'app-estadisticas'
})
export class EstadisticasComponent {
  ventas = signal([
    { producto: 'A', cantidad: 10, precio: 100 },
    { producto: 'B', cantidad: 5, precio: 200 },
    { producto: 'C', cantidad: 8, precio: 150 }
  ]);
  
  // Primer nivel: Total por producto
  totalesPorProducto = computed(() => 
    this.ventas().map(v => ({
      producto: v.producto,
      total: v.cantidad * v.precio
    }))
  );
  
  // Segundo nivel: Total general
  totalGeneral = computed(() => 
    this.totalesPorProducto()
      .reduce((sum, item) => sum + item.total, 0)
  );
  
  // Tercer nivel: Promedio
  promedioVenta = computed(() => {
    const total = this.totalGeneral();
    const cantidad = this.ventas().length;
    return cantidad > 0 ? total / cantidad : 0;
  });
  
  // Cuarto nivel: Análisis
  analisis = computed(() => {
    const promedio = this.promedioVenta();
    const total = this.totalGeneral();
    return {
      total,
      promedio,
      categoria: total > 5000 ? 'alto' : 'normal',
      mensaje: `Total de ventas: ${total}. Promedio: ${promedio.toFixed(2)}`
    };
  });
}
```

#### 3. Computed con Arrays y Objetos Complejos

```typescript
interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
  prioridad: 'alta' | 'media' | 'baja';
  fechaVencimiento: Date;
}

@Component({
  selector: 'app-tareas'
})
export class TareasComponent {
  tareas = signal<Tarea[]>([
    { 
      id: 1, 
      titulo: 'Tarea 1', 
      completada: false, 
      prioridad: 'alta',
      fechaVencimiento: new Date('2025-10-10')
    },
    { 
      id: 2, 
      titulo: 'Tarea 2', 
      completada: true, 
      prioridad: 'baja',
      fechaVencimiento: new Date('2025-10-08')
    },
    { 
      id: 3, 
      titulo: 'Tarea 3', 
      completada: false, 
      prioridad: 'media',
      fechaVencimiento: new Date('2025-10-09')
    }
  ]);
  
  // Filtros básicos
  tareasPendientes = computed(() => 
    this.tareas().filter(t => !t.completada)
  );
  
  tareasCompletadas = computed(() => 
    this.tareas().filter(t => t.completada)
  );
  
  // Filtro con ordenamiento
  tareasPorPrioridad = computed(() => {
    const prioridades = { alta: 3, media: 2, baja: 1 };
    return [...this.tareasPendientes()]
      .sort((a, b) => prioridades[b.prioridad] - prioridades[a.prioridad]);
  });
  
  // Tareas vencidas
  tareasVencidas = computed(() => {
    const hoy = new Date();
    return this.tareasPendientes()
      .filter(t => t.fechaVencimiento < hoy);
  });
  
  // Estadísticas complejas
  estadisticas = computed(() => {
    const todas = this.tareas();
    const pendientes = this.tareasPendientes();
    const vencidas = this.tareasVencidas();
    
    return {
      total: todas.length,
      completadas: todas.length - pendientes.length,
      pendientes: pendientes.length,
      vencidas: vencidas.length,
      porcentajeCompletado: todas.length > 0 
        ? ((todas.length - pendientes.length) / todas.length * 100).toFixed(1)
        : '0',
      tareasAltaPrioridad: pendientes.filter(t => t.prioridad === 'alta').length
    };
  });
}
```

#### 4. Computed con Signals de Búsqueda y Filtrado

```typescript
@Component({
  selector: 'app-buscador'
})
export class BuscadorComponent {
  productos = signal([
    { id: 1, nombre: 'Laptop HP', categoria: 'Electrónica', precio: 800 },
    { id: 2, nombre: 'Mouse Logitech', categoria: 'Electrónica', precio: 25 },
    { id: 3, nombre: 'Silla Gamer', categoria: 'Muebles', precio: 300 },
    { id: 4, nombre: 'Teclado Mecánico', categoria: 'Electrónica', precio: 120 }
  ]);
  
  terminoBusqueda = signal('');
  categoriaSeleccionada = signal<string>('todas');
  precioMaximo = signal<number>(1000);
  
  // Computed que combina múltiples filtros
  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const categoria = this.categoriaSeleccionada();
    const precioMax = this.precioMaximo();
    
    return this.productos().filter(producto => {
      const coincideNombre = producto.nombre.toLowerCase().includes(termino);
      const coincideCategoria = categoria === 'todas' || 
                                producto.categoria === categoria;
      const coincidePrecio = producto.precio <= precioMax;
      
      return coincideNombre && coincideCategoria && coincidePrecio;
    });
  });
  
  // Computed para categorías únicas
  categoriasDisponibles = computed(() => {
    const categorias = new Set(
      this.productos().map(p => p.categoria)
    );
    return ['todas', ...Array.from(categorias)];
  });
  
  // Estadísticas de resultados
  estadisticasBusqueda = computed(() => ({
    totalResultados: this.productosFiltrados().length,
    precioPromedio: this.productosFiltrados()
      .reduce((sum, p) => sum + p.precio, 0) / 
      (this.productosFiltrados().length || 1),
    hayResultados: this.productosFiltrados().length > 0
  }));
}
```

### Computed vs Effect: ¿Cuándo usar cada uno?

| Característica | `computed` | `effect` |
|---------------|-----------|----------|
| **Propósito** | Derivar estado | Efectos secundarios |
| **Retorna valor** | ✅ Sí | ❌ No |
| **Solo lectura** | ✅ Sí | ❌ No aplica |
| **Memorización** | ✅ Sí | ❌ No |
| **Uso típico** | Cálculos, filtrados, transformaciones | Logging, API calls, localStorage |

```typescript
@Component({
  selector: 'app-comparacion'
})
export class ComparacionComponent {
  nombre = signal('Juan');
  apellido = signal('Pérez');
  
  // ✅ USA COMPUTED: Para derivar estado
  nombreCompleto = computed(() => 
    `${this.nombre()} ${this.apellido()}`
  );
  
  // ✅ USA EFFECT: Para efectos secundarios
  constructor() {
    effect(() => {
      console.log('Nombre cambió a:', this.nombreCompleto());
      localStorage.setItem('nombre', this.nombreCompleto());
    });
  }
  
  // ❌ NO HAGAS ESTO: Effect para derivar estado
  // constructor() {
  //   effect(() => {
  //     this.nombreCompleto = `${this.nombre()} ${this.apellido()}`;
  //   });
  // }
}
```

### Optimización con Computed

#### Evitar Cálculos Costosos Innecesarios

```typescript
@Component({
  selector: 'app-optimizado'
})
export class OptimizadoComponent {
  datos = signal<number[]>(Array.from({ length: 10000 }, (_, i) => i));
  filtro = signal(5000);
  
  // ❌ MAL: Se recalcula en cada render
  get datosFiltradosMal() {
    console.log('Calculando... (cada render)');
    return this.datos().filter(d => d > this.filtro());
  }
  
  // ✅ BIEN: Solo recalcula cuando datos o filtro cambian
  datosFiltradosBien = computed(() => {
    console.log('Calculando... (solo cuando cambia)');
    return this.datos().filter(d => d > this.filtro());
  });
}
```

### Computed con Igualdad Personalizada

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-igualdad'
})
export class IgualdadComponent {
  objeto = signal({ x: 1, y: 2 });
  
  // Por defecto usa igualdad de referencia
  // Con computed, puedes controlar cuando se considera "cambiado"
  coordenadas = computed(() => {
    const obj = this.objeto();
    return { x: obj.x, y: obj.y };
  });
  
  // Si necesitas igualdad profunda, puedes usar equal
  // Nota: equal está disponible en versiones recientes de Angular
}
```

### Mejores Prácticas con Computed

✅ **Hacer:**
- Usa computed para derivar estado de otras señales
- Mantén los computed puros (sin efectos secundarios)
- Usa computed para cálculos costosos que necesitan memorización
- Encadena computed para lógica compleja paso a paso

❌ **Evitar:**
- No uses computed para efectos secundarios (usa `effect`)
- No modifiques señales dentro de computed
- No hagas cálculos síncronos simples que no se benefician de memorización
- No crees ciclos de dependencia entre computed

---

## 1. Comparativa: @Input vs input

### @Input (Decorador tradicional)

```typescript
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: `
    <div>
      <p>Nombre: {{ nombre }}</p>
      <p>Edad: {{ edad }}</p>
    </div>
  `
})
export class HijoComponent implements OnChanges {
  @Input() nombre: string = '';
  @Input() edad?: number;
  @Input() activo: boolean = false;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['nombre']) {
      console.log('Nombre cambió:', changes['nombre'].currentValue);
    }
  }
}

// Uso en padre
@Component({
  template: '<app-hijo [nombre]="miNombre" [edad]="30"></app-hijo>'
})
export class PadreComponent {
  miNombre = 'Juan';
}
```

**Características:**
- Propiedad tradicional de JavaScript
- Requiere `ngOnChanges` para reaccionar a cambios
- No es reactivo por sí mismo
- Necesita detección de cambios de Zone.js

### input (Signal Input)

```typescript
import { Component, input, computed, effect } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: `
    <div>
      <p>Nombre: {{ nombre() }}</p>
      <p>Edad: {{ edad() }}</p>
      <p>Activo: {{ activo() }}</p>
      <p>Mayúsculas: {{ nombreMayusculas() }}</p>
    </div>
  `
})
export class HijoComponent {
  // Signal input básico
  nombre = input<string>(''); // valor por defecto
  
  // Signal input requerido
  edad = input.required<number>();
  
  // Signal input con transformación
  activo = input(false, {
    transform: (value: boolean | string) => {
      return typeof value === 'string' ? value === 'true' : value;
    }
  });
  
  // Signal input con alias
  apellido = input('', { alias: 'surname' });
  
  // Computed basado en input
  nombreMayusculas = computed(() => this.nombre().toUpperCase());
  
  // Effect que reacciona a cambios
  constructor() {
    effect(() => {
      console.log('Nombre cambió a:', this.nombre());
    });
  }
}

// Uso en padre
@Component({
  template: '<app-hijo [nombre]="miNombre" [edad]="30"></app-hijo>'
})
export class PadreComponent {
  miNombre = 'Juan';
}
```

**Ventajas de input():**
- ✅ Es una señal reactiva
- ✅ Mejor rendimiento (detección de cambios granular)
- ✅ TypeScript más estricto con `input.required()`
- ✅ Transformaciones integradas
- ✅ Se puede usar en `computed` y `effect`
- ✅ No necesita `ngOnChanges`
- ✅ Sintaxis más concisa

---

## 2. Comparativa: @Output vs output

### @Output (Decorador tradicional)

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: `
    <button (click)="enviarDatos()">Enviar</button>
  `
})
export class HijoComponent {
  @Output() datos = new EventEmitter<string>();
  @Output() cambio = new EventEmitter<number>();
  
  enviarDatos() {
    this.datos.emit('Hola desde hijo');
  }
  
  enviarNumero() {
    this.cambio.emit(42);
  }
}

// Uso en padre
@Component({
  template: `
    <app-hijo 
      (datos)="manejarDatos($event)"
      (cambio)="manejarCambio($event)">
    </app-hijo>
  `
})
export class PadreComponent {
  manejarDatos(datos: string) {
    console.log(datos);
  }
  
  manejarCambio(num: number) {
    console.log(num);
  }
}
```

**Características:**
- Usa EventEmitter
- Más verboso
- Requiere importar EventEmitter

### output (Signal Output)

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: `
    <button (click)="enviarDatos()">Enviar</button>
  `
})
export class HijoComponent {
  // Output básico
  datos = output<string>();
  
  // Output con alias
  cambio = output<number>({ alias: 'cambioValor' });
  
  enviarDatos() {
    this.datos.emit('Hola desde hijo');
  }
  
  enviarNumero() {
    this.cambio.emit(42);
  }
}

// Uso en padre (igual que antes)
@Component({
  template: `
    <app-hijo 
      (datos)="manejarDatos($event)"
      (cambioValor)="manejarCambio($event)">
    </app-hijo>
  `
})
export class PadreComponent {
  manejarDatos(datos: string) {
    console.log(datos);
  }
  
  manejarCambio(num: number) {
    console.log(num);
  }
}
```

**Ventajas de output():**
- ✅ Sintaxis más limpia
- ✅ No necesita EventEmitter
- ✅ Mejor integración con el sistema de señales
- ✅ Type-safe por defecto
- ✅ Menos imports necesarios
- ✅ API consistente con input()

---

## 3. Comparativa: @ViewChild vs viewChild

### @ViewChild (Decorador tradicional)

```typescript
import { 
  Component, 
  ViewChild, 
  ElementRef, 
  AfterViewInit 
} from '@angular/core';

@Component({
  selector: 'app-padre',
  template: `
    <input #miInput type="text">
    <button (click)="enfocarInput()">Enfocar</button>
    <p #parrafo>Texto</p>
  `
})
export class PadreComponent implements AfterViewInit {
  // ViewChild de elemento
  @ViewChild('miInput') input?: ElementRef<HTMLInputElement>;
  
  // ViewChild de componente
  @ViewChild(HijoComponent) hijo?: HijoComponent;
  
  // ViewChild con opciones
  @ViewChild('parrafo', { read: ElementRef, static: false }) 
  parrafo?: ElementRef;
  
  ngAfterViewInit() {
    // Solo disponible después de AfterViewInit
    this.input?.nativeElement.focus();
  }
  
  enfocarInput() {
    if (this.input) {
      this.input.nativeElement.focus();
    }
  }
}
```

**Características:**
- Puede ser `undefined` inicialmente
- Requiere `AfterViewInit`
- Necesita verificación de null/undefined
- No es reactivo

### viewChild (Signal ViewChild)

```typescript
import { Component, viewChild, ElementRef, effect } from '@angular/core';

@Component({
  selector: 'app-padre',
  template: `
    <input #miInput type="text">
    <button (click)="enfocarInput()">Enfocar</button>
    <p #parrafo>Texto</p>
  `
})
export class PadreComponent {
  // viewChild básico (puede ser undefined)
  input = viewChild<ElementRef<HTMLInputElement>>('miInput');
  
  // viewChild requerido (nunca undefined)
  inputRequerido = viewChild.required<ElementRef>('miInput');
  
  // viewChild de componente
  hijo = viewChild(HijoComponent);
  
  // viewChild con opciones de lectura
  parrafo = viewChild('parrafo', { read: ElementRef });
  
  constructor() {
    // Effect que reacciona cuando el viewChild está disponible
    effect(() => {
      const inputEl = this.inputRequerido();
      console.log('Input disponible:', inputEl);
      
      // Automáticamente ejecutado cuando el elemento está listo
      inputEl.nativeElement.focus();
    });
  }
  
  enfocarInput() {
    // Con required, no necesitas verificar undefined
    this.inputRequerido().nativeElement.focus();
    
    // Con opcional, sí necesitas verificar
    const input = this.input();
    if (input) {
      input.nativeElement.focus();
    }
  }
}
```

**Ventajas de viewChild():**
- ✅ Es una señal reactiva
- ✅ Puede usarse en `effect` y `computed`
- ✅ `viewChild.required()` garantiza que existe
- ✅ No necesita `AfterViewInit` con effects
- ✅ Sintaxis más limpia
- ✅ Mejor type-safety

---

## 4. Comparativa: @ViewChildren vs viewChildren

### @ViewChildren (Decorador tradicional)

```typescript
import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';

@Component({
  selector: 'app-lista',
  template: `
    <div #item *ngFor="let i of items">Item {{ i }}</div>
    <button (click)="contarItems()">Contar</button>
  `
})
export class ListaComponent {
  items = [1, 2, 3, 4, 5];
  
  @ViewChildren('item') 
  elementos?: QueryList<ElementRef>;
  
  ngAfterViewInit() {
    this.elementos?.changes.subscribe(() => {
      console.log('Items cambiaron');
    });
  }
  
  contarItems() {
    console.log('Total:', this.elementos?.length);
  }
}
```

### viewChildren (Signal ViewChildren)

```typescript
import { Component, viewChildren, ElementRef, effect } from '@angular/core';

@Component({
  selector: 'app-lista',
  template: `
    <div #item *ngFor="let i of items">Item {{ i }}</div>
    <button (click)="contarItems()">Contar</button>
  `
})
export class ListaComponent {
  items = [1, 2, 3, 4, 5];
  
  // viewChildren retorna un signal de array
  elementos = viewChildren<ElementRef>('item');
  
  constructor() {
    // Effect que reacciona a cambios en la lista
    effect(() => {
      const items = this.elementos();
      console.log('Número de items:', items.length);
    });
  }
  
  contarItems() {
    console.log('Total:', this.elementos().length);
  }
}
```

**Ventajas de viewChildren():**
- ✅ Retorna signal de array (no QueryList)
- ✅ Reactividad automática
- ✅ Más simple de usar
- ✅ No necesita suscripciones

---

## Resumen de Ventajas de las Señales

### Rendimiento
- ⚡ Detección de cambios granular
- ⚡ Menos re-renderizados innecesarios
- ⚡ Posibilidad de eliminar Zone.js

### Developer Experience
- 💻 Código más limpio y conciso
- 💻 Mejor type-safety
- 💻 Menos boilerplate
- 💻 API más consistente

### Reactividad
- 🔄 Sistema reactivo explícito
- 🔄 Composición con `computed`
- 🔄 Efectos con `effect`
- 🔄 Fácil rastreo de dependencias

### Mantenibilidad
- 📦 Código más predecible
- 📦 Debugging más fácil
- 📦 Menos lifecycle hooks necesarios

---

## Migración Gradual

Angular permite usar ambos sistemas simultáneamente:

```typescript
@Component({
  selector: 'app-hibrido',
  template: `
    <p>Tradicional: {{ valorTradicional }}</p>
    <p>Signal: {{ valorSignal() }}</p>
  `
})
export class HibridoComponent {
  // Decoradores tradicionales
  @Input() valorTradicional = '';
  
  // Signals nuevos
  valorSignal = input('');
  
  contador = signal(0);
  
  // Puedes mezclar ambos enfoques
}
```

**Recomendación:** Comienza usando signals en componentes nuevos y migra gradualmente los existentes.

---

## Referencias y Recursos Externos

### Documentación Oficial de Angular

- **Angular Signals - Guía Oficial**
  https://angular.dev/guide/signals

- **Angular Signals API Reference**
  https://angular.dev/api/core/signal

- **Guía de Migración a Signals**
  https://angular.dev/guide/signals/migration

- **Input Signals**
  https://angular.dev/guide/components/inputs

- **Output Signals**
  https://angular.dev/guide/components/outputs

- **ViewChild y ViewChildren con Signals**
  https://angular.dev/api/core/viewChild

### Artículos y Blog Posts

- **Angular Blog: Introducing Angular Signals**
  https://blog.angular.io/angular-v16-is-here-4d7a28ec680d

- **Angular Blog: Signal APIs are now stable**
  https://blog.angular.dev/meet-angular-v19-7b29dfd05b84

- **Angular's New Signal-Based Reactivity Model**
  https://netbasal.com/angular-signals-the-future-of-change-detection

### Video Tutoriales

- **Angular Official YouTube Channel**
  https://www.youtube.com/@Angular

- **Angular Signals - What, Why, and How? (Deborah Kurata)**
  Buscar en YouTube: "Angular Signals Deborah Kurata"

- **Angular Signals Deep Dive (Joshua Morony)**
  Buscar en YouTube: "Angular Signals Joshua Morony"

### Recursos de la Comunidad

- **Angular Community Discord**
  https://discord.gg/angular

- **Stack Overflow - Angular Signals Tag**
  https://stackoverflow.com/questions/tagged/angular-signals

- **Reddit - r/Angular**
  https://www.reddit.com/r/Angular/

### Herramientas y Utilidades

- **Angular DevTools (Chrome Extension)**
  Para debugging de signals y detección de cambios
  https://chrome.google.com/webstore/detail/angular-devtools

- **Angular Update Guide**
  Para migrar entre versiones de Angular
  https://update.angular.io/

### Libros y Cursos Recomendados

- **Angular.dev - Tutorial Interactivo**
  https://angular.dev/tutorials

- **Angular University**
  https://angular-university.io/

- **Ultimate Courses - Angular**
  https://ultimatecourses.com/courses/angular

### Repositorios de Ejemplo

- **Angular GitHub - Ejemplos Oficiales**
  https://github.com/angular/angular/tree/main/adev/src/content/examples

- **Angular Signals Examples**
  https://github.com/angular/angular/tree/main/packages/core/test/acceptance

### Comparativas y Benchmarks

- **Angular Change Detection Benchmark**
  https://github.com/krausest/js-framework-benchmark

- **Signals vs Zone.js Performance Comparison**
  Buscar artículos recientes en Medium y Dev.to sobre "Angular Signals Performance"

### Mantenerse Actualizado

- **Angular Blog Oficial**
  https://blog.angular.dev/

- **Angular Roadmap**
  https://angular.dev/roadmap

- **Angular RFC (Request for Comments)**
  https://github.com/angular/angular/discussions

### Cheat Sheets y Referencias Rápidas

- **Angular Signals Cheat Sheet**
  Buscar "Angular Signals Cheat Sheet PDF" en GitHub

- **Angular Docs - Signals Overview**
  https://angular.dev/guide/signals/overview

---

## Conclusión

Las señales representan el futuro de Angular, ofreciendo:
- Mejor rendimiento a través de detección de cambios granular
- Código más limpio y predecible
- Preparación para eliminar Zone.js
- API moderna y consistente

La migración de decoradores tradicionales a signals es gradual y compatible, permitiendo adoptar la nueva API a tu ritmo.