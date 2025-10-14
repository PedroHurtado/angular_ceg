# Guía Completa de ViewContainerRef en Angular

## 1. Inyección por Constructor

La forma más directa de usar ViewContainerRef es inyectándolo en el constructor del componente.

```typescript
import { Component, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `<div>Componente con ViewContainerRef</div>`
})
export class EjemploComponent {
  constructor(private viewContainerRef: ViewContainerRef) {
    // El ViewContainerRef está disponible inmediatamente
    console.log('ViewContainerRef inyectado:', this.viewContainerRef);
  }

  cargarComponente() {
    // Usar directamente para crear componentes dinámicos
    this.viewContainerRef.clear();
    // Aquí puedes crear componentes dinámicamente
  }
}
```

**Ventajas:**
- Acceso inmediato al ViewContainerRef
- Referencia al contenedor del componente actual
- Ideal para crear componentes hermanos

**Limitaciones:**
- Se refiere al contenedor del propio componente
- No permite control específico de ubicación

## 2. Declaración con ng-container

Usando `@ViewChild` con `ng-container` y la opción `read: ViewContainerRef` obtienes control preciso sobre dónde insertar contenido dinámico.

```typescript
import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-contenedor',
  template: `
    <div>
      <h2>Contenedor Principal</h2>
      <ng-container #dinamico></ng-container>
      <p>Contenido después del container</p>
    </div>
  `
})
export class ContenedorComponent implements AfterViewInit {
  @ViewChild('dinamico', { read: ViewContainerRef }) 
  containerRef!: ViewContainerRef;

  ngAfterViewInit() {
    // Disponible después de la inicialización de la vista
    console.log('Container ref:', this.containerRef);
  }

  insertarComponente(componenteClass: any) {
    this.containerRef.clear();
    const componentRef = this.containerRef.createComponent(componenteClass);
    return componentRef;
  }
}
```

**Ventajas:**
- Control exacto de la ubicación de inserción
- Múltiples puntos de inserción en el mismo template
- Sintaxis clara y declarativa

**Cuándo usar:**
- Cuando necesitas puntos específicos de inserción
- Para crear sistemas de layout dinámicos
- Cuando trabajas con múltiples contenedores

## 3. Carga con Import Dinámico

La carga dinámica con `import()` permite lazy loading de componentes, mejorando el rendimiento inicial.

```typescript
import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-carga-dinamica',
  template: `
    <div>
      <button (click)="cargarComponenteDinamico()">Cargar Componente</button>
      <ng-container #contenedor></ng-container>
    </div>
  `
})
export class CargaDinamicaComponent implements AfterViewInit {
  @ViewChild('contenedor', { read: ViewContainerRef }) 
  viewContainerRef!: ViewContainerRef;

  async cargarComponenteDinamico() {
    // Limpiar contenedor
    this.viewContainerRef.clear();

    // Import dinámico - lazy loading
    const { ComponenteDinamicoComponent } = await import('./componente-dinamico.component');
    
    // Crear instancia del componente
    const componentRef = this.viewContainerRef.createComponent(ComponenteDinamicoComponent);
    
    // Configurar inputs si es necesario
    componentRef.instance.dato = 'Valor desde el padre';
    
    // Suscribirse a outputs
    componentRef.instance.eventoSalida.subscribe((data: any) => {
      console.log('Evento recibido:', data);
    });
  }

  async cargarMultiplesComponentes() {
    this.viewContainerRef.clear();

    // Cargar varios componentes dinámicamente
    const componentes = [
      import('./componente-a.component').then(m => m.ComponenteA),
      import('./componente-b.component').then(m => m.ComponenteB),
      import('./componente-c.component').then(m => m.ComponenteC)
    ];

    const clases = await Promise.all(componentes);
    
    clases.forEach(ComponenteClass => {
      this.viewContainerRef.createComponent(ComponenteClass);
    });
  }
}
```

**Ejemplo de Componente Dinámico:**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-componente-dinamico',
  standalone: true,
  template: `
    <div class="dinamico">
      <h3>{{ dato }}</h3>
      <button (click)="emitir()">Emitir Evento</button>
    </div>
  `,
  styles: [`
    .dinamico {
      padding: 20px;
      border: 2px solid #007bff;
      margin: 10px 0;
    }
  `]
})
export class ComponenteDinamicoComponent {
  @Input() dato: string = '';
  @Output() eventoSalida = new EventEmitter<string>();

  emitir() {
    this.eventoSalida.emit('Datos del componente dinámico');
  }
}
```

**Ventajas del Import Dinámico:**
- Reduce el bundle inicial
- Carga bajo demanda
- Mejora el tiempo de carga inicial
- Ideal para funcionalidades opcionales

## 4. Evitar detectChanges con Signals

Angular 17+ introduce signals que pueden reducir o eliminar la necesidad de llamar manualmente a `detectChanges()`.

### Enfoque Tradicional (sin signals):
```typescript
import { Component, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tradicional',
  template: `
    <div>
      <p>Contador: {{ contador }}</p>
      <button (click)="incrementar()">Incrementar</button>
      <ng-container #contenedor></ng-container>
    </div>
  `
})
export class TradicionalComponent {
  @ViewChild('contenedor', { read: ViewContainerRef }) 
  viewContainerRef!: ViewContainerRef;

  contador = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  incrementar() {
    this.contador++;
    // Necesario para actualizar la vista
    this.cdr.detectChanges();
  }

  async cargarComponente() {
    const { MiComponente } = await import('./mi-componente.component');
    const ref = this.viewContainerRef.createComponent(MiComponente);
    ref.instance.valor = this.contador;
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }
}
```

### Enfoque con Signals:
```typescript
import { Component, ViewChild, ViewContainerRef, signal, effect } from '@angular/core';

@Component({
  selector: 'app-con-signals',
  standalone: true,
  template: `
    <div>
      <p>Contador: {{ contador() }}</p>
      <button (click)="incrementar()">Incrementar</button>
      <ng-container #contenedor></ng-container>
    </div>
  `
})
export class ConSignalsComponent {
  @ViewChild('contenedor', { read: ViewContainerRef }) 
  viewContainerRef!: ViewContainerRef;

  // Signal en lugar de propiedad normal
  contador = signal(0);

  constructor() {
    // Effect para reaccionar a cambios del signal
    effect(() => {
      console.log('Contador cambió:', this.contador());
      // No necesitas detectChanges() manualmente
    });
  }

  incrementar() {
    this.contador.update(v => v + 1);
    // No se necesita detectChanges() - automático con signals
  }

  async cargarComponente() {
    const { MiComponente } = await import('./mi-componente.component');
    const ref = this.viewContainerRef.createComponent(MiComponente);
    
    // Pasar signal o su valor
    ref.setInput('valor', this.contador());
    
    // No necesitas detectChanges() si usas signals
  }
}
```

### Componente Dinámico con Signals:
```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dinamico-signal',
  standalone: true,
  template: `
    <div class="card">
      <h3>Valor: {{ valor() }}</h3>
      <button (click)="alCambiar.emit(valor() + 1)">
        Incrementar
      </button>
    </div>
  `
})
export class DinamicoSignalComponent {
  // Input signal (Angular 17.1+)
  valor = input<number>(0);
  
  // Output signal
  alCambiar = output<number>();
}
```

### Ejemplo Completo con Signals y Carga Dinámica:
```typescript
import { Component, ViewChild, ViewContainerRef, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-ejemplo-completo',
  standalone: true,
  template: `
    <div class="container">
      <h2>Gestión Dinámica con Signals</h2>
      
      <div class="stats">
        <p>Componentes cargados: {{ componentesCargados() }}</p>
        <p>Último valor: {{ ultimoValor() }}</p>
      </div>

      <button (click)="agregarComponente()">Agregar Componente</button>
      <button (click)="limpiar()">Limpiar Todo</button>

      <ng-container #contenedor></ng-container>
    </div>
  `
})
export class EjemploCompletoComponent {
  @ViewChild('contenedor', { read: ViewContainerRef }) 
  viewContainerRef!: ViewContainerRef;

  componentesCargados = signal(0);
  ultimoValor = signal(0);
  
  // Computed signal - se actualiza automáticamente
  totalValores = computed(() => 
    this.componentesCargados() * this.ultimoValor()
  );

  constructor() {
    // Effect para logging - se ejecuta cuando cambian los signals
    effect(() => {
      console.log(`Estado: ${this.componentesCargados()} componentes, valor ${this.ultimoValor()}`);
      // No se necesita detectChanges()
    });
  }

  async agregarComponente() {
    const { DinamicoSignalComponent } = await import('./dinamico-signal.component');
    
    const componentRef = this.viewContainerRef.createComponent(DinamicoSignalComponent);
    
    // Configurar con signal value
    componentRef.setInput('valor', this.ultimoValor());
    
    // Suscribirse al output
    componentRef.instance.alCambiar.subscribe((nuevoValor: number) => {
      this.ultimoValor.set(nuevoValor);
      // No necesitas detectChanges()
    });
    
    // Actualizar contador
    this.componentesCargados.update(v => v + 1);
    // Los cambios se reflejan automáticamente
  }

  limpiar() {
    this.viewContainerRef.clear();
    this.componentesCargados.set(0);
    this.ultimoValor.set(0);
    // Todo se actualiza automáticamente
  }
}
```

## Comparación: Signals vs Tradicional

| Aspecto | Tradicional | Con Signals |
|---------|-------------|-------------|
| Detección de cambios | Manual con `detectChanges()` | Automática |
| Reactividad | Zone.js | Granular con signals |
| Performance | Revisa todo el árbol | Solo lo necesario |
| Código | Más verbose | Más limpio |
| Complejidad | Media | Baja |

## Ventajas de Usar Signals con ViewContainerRef

1. **No necesitas ChangeDetectorRef**: Los signals actualizan automáticamente las vistas
2. **Mejor performance**: Solo se actualizan los componentes afectados
3. **Código más limpio**: Sin llamadas manuales a `detectChanges()`
4. **Mejor debugging**: El flujo de datos es más claro
5. **Compatible con zoneless**: Prepara tu app para Angular sin Zone.js

## Mejores Prácticas

1. **Usa signals para estado reactivo**: Evita la necesidad de detección manual de cambios
2. **Limpia los contenedores**: Siempre llama a `clear()` antes de crear nuevos componentes
3. **Maneja errores en imports dinámicos**: Usa try-catch para imports que pueden fallar
4. **Destruye componentes correctamente**: Guarda referencias si necesitas destruirlos manualmente
5. **Prefiere standalone components**: Son más fáciles de cargar dinámicamente

## Ejemplo de Producción Completo

```typescript
import { Component, ViewChild, ViewContainerRef, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-gestor-dinamico',
  standalone: true,
  template: `
    <div class="gestor">
      <h2>Gestor de Componentes Dinámicos</h2>
      
      <div class="controles">
        <select #tipoSelect>
          <option value="dashboard">Dashboard</option>
          <option value="formulario">Formulario</option>
          <option value="tabla">Tabla</option>
        </select>
        <button (click)="cargar(tipoSelect.value)">Cargar</button>
        <button (click)="limpiarTodo()">Limpiar</button>
      </div>

      <div class="info">
        Componentes activos: {{ contadorComponentes() }}
      </div>

      <ng-container #contenedor></ng-container>
    </div>
  `
})
export class GestorDinamicoComponent {
  @ViewChild('contenedor', { read: ViewContainerRef }) 
  contenedor!: ViewContainerRef;

  contadorComponentes = signal(0);
  private referencias = new Map();

  constructor(private destroyRef: DestroyRef) {}

  async cargar(tipo: string) {
    try {
      const componente = await this.importarComponente(tipo);
      const ref = this.contenedor.createComponent(componente);
      
      // Configurar el componente
      this.configurarComponente(ref, tipo);
      
      // Guardar referencia
      const id = Date.now();
      this.referencias.set(id, ref);
      
      // Actualizar contador
      this.contadorComponentes.update(v => v + 1);

      // Cleanup automático al destruir
      this.destroyRef.onDestroy(() => {
        this.referencias.delete(id);
      });

    } catch (error) {
      console.error('Error cargando componente:', error);
    }
  }

  private async importarComponente(tipo: string) {
    switch(tipo) {
      case 'dashboard':
        return (await import('./dashboard.component')).DashboardComponent;
      case 'formulario':
        return (await import('./formulario.component')).FormularioComponent;
      case 'tabla':
        return (await import('./tabla.component')).TablaComponent;
      default:
        throw new Error('Tipo de componente desconocido');
    }
  }

  private configurarComponente(ref: any, tipo: string) {
    // Configurar inputs según el tipo
    ref.setInput('tipo', tipo);
    ref.setInput('timestamp', Date.now());

    // Suscribirse a eventos
    if (ref.instance.alCerrar) {
      ref.instance.alCerrar
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.removerComponente(ref);
        });
    }
  }

  private removerComponente(ref: any) {
    const index = this.contenedor.indexOf(ref.hostView);
    if (index !== -1) {
      this.contenedor.remove(index);
      this.contadorComponentes.update(v => v - 1);
    }
  }

  limpiarTodo() {
    this.contenedor.clear();
    this.referencias.clear();
    this.contadorComponentes.set(0);
  }
}
```

## Conclusión

- **Inyección por constructor**: Simple y directo para casos básicos
- **ng-container con ViewChild**: Control preciso de ubicación
- **Import dinámico**: Mejor performance con lazy loading
- **Signals**: Elimina la necesidad de `detectChanges()` y mejora el rendimiento

Los signals representan el futuro de Angular, haciendo el código más simple y eficiente al eliminar la necesidad de gestión manual de detección de cambios.