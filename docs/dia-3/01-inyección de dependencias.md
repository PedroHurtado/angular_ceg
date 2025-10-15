# Inyección de Dependencias en Angular

## Introducción

La **Inyección de Dependencias (DI)** es un patrón de diseño fundamental en Angular que permite crear aplicaciones más modulares, testeables y mantenibles. Angular proporciona un sistema de DI robusto y jerárquico que gestiona la creación e inyección de dependencias automáticamente.

## ¿Qué es la Inyección de Dependencias?

Es un patrón donde una clase recibe sus dependencias desde fuentes externas en lugar de crearlas ella misma. En lugar de:

```typescript
class MiComponente {
  servicio = new MiServicio(); // ❌ Mala práctica
}
```

Hacemos:

```typescript
class MiComponente {
  constructor(private servicio: MiServicio) {} // ✅ Buena práctica
}
```

## Servicios

Los **servicios** son clases que encapsulan lógica de negocio, acceso a datos o cualquier funcionalidad reutilizable.

### Creación de un Servicio

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  obtenerUsuarios() {
    return ['Juan', 'María', 'Pedro'];
  }
}
```

### Inyección en Componentes

```typescript
import { Component } from '@angular/core';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  template: '<ul><li *ngFor="let user of usuarios">{{ user }}</li></ul>'
})
export class ListaUsuariosComponent {
  usuarios: string[];
  
  constructor(private usuarioService: UsuarioService) {
    this.usuarios = this.usuarioService.obtenerUsuarios();
  }
}
```

## Patrón Singleton

Por defecto, cuando usamos `providedIn: 'root'`, Angular crea una **única instancia** del servicio para toda la aplicación (patrón Singleton).

```typescript
@Injectable({
  providedIn: 'root' // Una sola instancia para toda la app
})
export class ConfigService {
  private config = { tema: 'oscuro' };
  
  getConfig() {
    return this.config;
  }
}
```

### Instancias Múltiples

Si necesitas instancias diferentes por módulo o componente:

```typescript
@Component({
  selector: 'app-mi-componente',
  providers: [MiServicio] // Nueva instancia solo para este componente
})
export class MiComponente {}
```

## Injection Token (InjectionToken)

Los **InjectionToken** permiten inyectar valores primitivos, objetos de configuración o cualquier valor que no sea una clase.

### Creación y Uso

```typescript
import { InjectionToken } from '@angular/core';

// Definir el token
export const API_URL = new InjectionToken<string>('api.url');

// Proporcionar el valor
@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.miapp.com' }
  ]
})
export class AppModule {}

// Inyectar en un servicio
@Injectable()
export class ApiService {
  constructor(@Inject(API_URL) private apiUrl: string) {
    console.log(this.apiUrl); // 'https://api.miapp.com'
  }
}
```

### Ventajas de InjectionToken

- **Type-safe**: Proporciona tipado fuerte
- **Evita colisiones**: El token es único
- **Documentación**: El nombre describe el propósito

## Providers: Diferentes Estrategias

### 1. useClass

Proporciona una instancia de una clase:

```typescript
providers: [
  { provide: LoggerService, useClass: LoggerService }
  // Equivalente a: providers: [LoggerService]
]
```

### 2. useValue

Proporciona un valor estático:

```typescript
const CONFIG = {
  apiUrl: 'https://api.ejemplo.com',
  timeout: 5000
};

providers: [
  { provide: 'APP_CONFIG', useValue: CONFIG }
]
```

### 3. useFactory

Crea la dependencia usando una función factory:

```typescript
export function loggerFactory(config: ConfigService) {
  return config.isProduction() 
    ? new ProductionLogger() 
    : new DevLogger();
}

providers: [
  {
    provide: Logger,
    useFactory: loggerFactory,
    deps: [ConfigService] // Dependencias de la factory
  }
]
```

**Casos de uso para Factory:**
- Lógica condicional de creación
- Inicialización asíncrona
- Dependencias complejas

### 4. useExisting

Crea un alias para un provider existente:

```typescript
providers: [
  LoggerService,
  { provide: 'Logger', useExisting: LoggerService }
]
```

## Jerarquía de Inyectores

Angular tiene un sistema jerárquico de inyectores:

```
Root Injector (providedIn: 'root')
    ↓
Module Injector (@NgModule providers)
    ↓
Component Injector (@Component providers)
    ↓
Element Injector (directivas)
```

### Ejemplo de Jerarquía

```typescript
// Nivel raíz - compartido por toda la app
@Injectable({ providedIn: 'root' })
export class GlobalService {}

// Nivel módulo
@NgModule({
  providers: [ModuleService]
})
export class FeatureModule {}

// Nivel componente - nueva instancia
@Component({
  providers: [LocalService]
})
export class MiComponente {}
```

## Modificadores de Inyección

### @Optional

Hace que la dependencia sea opcional:

```typescript
constructor(@Optional() private logger?: LoggerService) {
  if (this.logger) {
    this.logger.log('Servicio disponible');
  }
}
```

### @Self

Busca la dependencia solo en el inyector del elemento actual:

```typescript
constructor(@Self() private servicio: MiServicio) {}
```

### @SkipSelf

Omite el inyector actual y busca en los padres:

```typescript
constructor(@SkipSelf() private servicio: MiServicio) {}
```

### @Host

Busca hasta el componente host:

```typescript
constructor(@Host() private servicio: MiServicio) {}
```

## Inyección en Angular 14+: inject()

Angular 14 introdujo la función `inject()` para inyección funcional:

```typescript
import { inject } from '@angular/core';

export class MiComponente {
  private usuarioService = inject(UsuarioService);
  private apiUrl = inject(API_URL);
  
  usuarios$ = this.usuarioService.getUsuarios();
}
```

### Ventajas de inject()

- Más conciso
- Permite inyección fuera del constructor
- Ideal para composición funcional

## Ejemplo Completo: Sistema de Logging

```typescript
// 1. Token de configuración
export const LOG_LEVEL = new InjectionToken<string>('log.level');

// 2. Interface
export interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// 3. Implementaciones
@Injectable()
export class ConsoleLogger implements Logger {
  constructor(@Inject(LOG_LEVEL) private level: string) {}
  
  log(message: string) {
    if (this.level !== 'error') {
      console.log(message);
    }
  }
  
  error(message: string) {
    console.error(message);
  }
}

@Injectable()
export class RemoteLogger implements Logger {
  constructor(private http: HttpClient) {}
  
  log(message: string) {
    this.http.post('/api/logs', { level: 'info', message }).subscribe();
  }
  
  error(message: string) {
    this.http.post('/api/logs', { level: 'error', message }).subscribe();
  }
}

// 4. Factory
export function loggerFactory(
  level: string,
  http: HttpClient
): Logger {
  return level === 'production' 
    ? new RemoteLogger(http)
    : new ConsoleLogger(level);
}

// 5. Configuración
@NgModule({
  providers: [
    { provide: LOG_LEVEL, useValue: 'debug' },
    {
      provide: Logger,
      useFactory: loggerFactory,
      deps: [LOG_LEVEL, HttpClient]
    }
  ]
})
export class AppModule {}

// 6. Uso
@Component({
  selector: 'app-root',
  template: '...'
})
export class AppComponent {
  constructor(private logger: Logger) {
    this.logger.log('App iniciada');
  }
}
```

## Best Practices

### ✅ Hacer

- Usar `providedIn: 'root'` para servicios singleton globales
- Crear servicios pequeños y enfocados (Single Responsibility)
- Usar InjectionToken para valores no-clase
- Aprovechar la jerarquía de inyectores para alcance
- Usar `inject()` para código más limpio en Angular 14+

### ❌ Evitar

- Crear instancias manualmente con `new`
- Servicios con demasiadas responsabilidades
- Lógica de negocio en componentes
- Inyección circular de dependencias
- Usar strings como tokens (usar InjectionToken)

## Testing con DI

La DI facilita enormemente el testing:

```typescript
describe('UsuarioComponent', () => {
  let component: UsuarioComponent;
  let mockService: jasmine.SpyObj<UsuarioService>;

  beforeEach(() => {
    mockService = jasmine.createSpyObj('UsuarioService', ['getUsuarios']);
    
    TestBed.configureTestingModule({
      declarations: [UsuarioComponent],
      providers: [
        { provide: UsuarioService, useValue: mockService }
      ]
    });
    
    component = TestBed.createComponent(UsuarioComponent).componentInstance;
  });

  it('debe cargar usuarios', () => {
    mockService.getUsuarios.and.returnValue(['Test User']);
    component.ngOnInit();
    expect(component.usuarios.length).toBe(1);
  });
});
```

## Recursos Adicionales

- [Documentación oficial de Angular DI](https://angular.io/guide/dependency-injection)
- [Angular Providers Guide](https://angular.io/guide/providers)
- [Hierarchical Injectors](https://angular.io/guide/hierarchical-dependency-injection)

---


