# Arquitectura Vertical Slice en Angular

Implementación de Vertical Slice Architecture en Angular utilizando InjectionTokens, segregación de interfaces (ISP) y servicios genéricos para minimizar el bundle size.

## Índice

- [Conceptos Clave](#conceptos-clave)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Implementación](#implementación)
  - [1. Operaciones Base](#1-operaciones-base)
  - [2. Factory de InjectionTokens](#2-factory-de-injectiontokens)
  - [3. Configuración de la Aplicación](#3-configuración-de-la-aplicación)
  - [4. Uso en Slices](#4-uso-en-slices)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Ventajas](#ventajas)
- [Notas Importantes](#notas-importantes)

## Conceptos Clave

### ¿Por qué esta arquitectura?

1. **Vertical Slice**: Cada feature tiene todo lo necesario en un solo archivo (interface + token de servicio)
2. **Interface Segregation Principle (ISP)**: Los componentes solo tienen acceso a las operaciones que necesitan
3. **InjectionToken con `providedIn: 'root'`**: Singleton automático sin repetir código
4. **Segregación de operaciones**: Get, Create, Update, Delete como clases separadas
5. **Bundle mínimo**: Una sola clase genérica reutilizada, tree-shaking óptimo

### Trade-offs

- ✅ **Bundle pequeño**: Código genérico reutilizado
- ✅ **Type-safe**: TypeScript garantiza el uso correcto
- ✅ **Singleton**: `providedIn: 'root'` crea una instancia única por token
- ⚠️ **Múltiples instancias por recurso**: Si usas diferentes operaciones del mismo path, se crean tokens diferentes (no es problema si los servicios son stateless)

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── resource-operations.ts      # Clases base de operaciones
│   │   └── resource-token.factory.ts   # Factory de InjectionTokens
│   ├── features/
│   │   ├── users/
│   │   │   ├── users.slice.ts          # Interface + Token
│   │   │   └── user-list.component.ts
│   │   ├── products/
│   │   │   ├── products.slice.ts
│   │   │   └── product-list.component.ts
│   │   └── config/
│   │       ├── config.slice.ts
│   │       └── config.component.ts
│   └── app.config.ts
```

## Implementación

### 1. Operaciones Base

Crea las clases base con segregación de operaciones:

```typescript
// core/resource-operations.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Operación base para lectura (GET)
 */
export class GetOperation<T> {
  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {}
  
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint);
  }
  
  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
  }
}

/**
 * Operación para creación (POST)
 * Independiente de otras operaciones
 */
export class CreateOperation<T> {
  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {}
  
  create(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.endpoint, item);
  }
}

/**
 * Operación para actualización (PUT/PATCH)
 * Hereda de GetOperation para poder leer antes de actualizar
 */
export class UpdateOperation<T> extends GetOperation<T> {
  update(id: number | string, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, item);
  }
  
  patch(id: number | string, item: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.endpoint}/${id}`, item);
  }
}

/**
 * Operación para eliminación (DELETE)
 * Hereda de GetOperation para poder verificar antes de borrar
 */
export class DeleteOperation<T> extends GetOperation<T> {
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}

/**
 * Operación CRUD completa
 * Combina todas las operaciones
 */
export class CrudOperation<T> extends GetOperation<T> {
  create(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.endpoint, item);
  }
  
  update(id: number | string, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, item);
  }
  
  patch(id: number | string, item: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.endpoint}/${id}`, item);
  }
  
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

### 2. Factory de InjectionTokens

Crea una función factory que genera InjectionTokens con singleton automático:

```typescript
// core/resource-token.factory.ts
import { InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  GetOperation, 
  CreateOperation, 
  UpdateOperation, 
  DeleteOperation,
  CrudOperation 
} from './resource-operations';

/**
 * Token para la URL base de la API
 * Se configura en app.config.ts
 */
export const BASE_URL = new InjectionToken<string>('BASE_URL');

/**
 * Mapeo de tipos de operación a sus clases correspondientes
 */
type OperationMap<T> = {
  get: GetOperation<T>;
  create: CreateOperation<T>;
  update: UpdateOperation<T>;
  delete: DeleteOperation<T>;
  crud: CrudOperation<T>;
};

/**
 * Factory function que crea InjectionTokens para recursos HTTP
 * 
 * @param path - Ruta relativa del recurso (ej: '/api/users')
 * @param operation - Tipo de operación: 'get' | 'create' | 'update' | 'delete' | 'crud'
 * @returns InjectionToken con singleton automático (providedIn: 'root')
 * 
 * @example
 * ```typescript
 * // Solo lectura
 * export const CONFIG_SERVICE = provideResource<Config>('/api/config', 'get');
 * 
 * // CRUD completo (por defecto)
 * export const USER_SERVICE = provideResource<User>('/api/users');
 * ```
 */
export function provideResource<
  T,
  Op extends keyof OperationMap<T> = 'crud'
>(
  path: string,
  operation?: Op
): InjectionToken<OperationMap<T>[Op]> {
  const op = (operation || 'crud') as Op;
  
  return new InjectionToken<OperationMap<T>[Op]>(
    `${op}:${path}`, // Nombre único para debugging
    {
      providedIn: 'root', // ✅ Singleton automático
      factory: () => {
        const http = inject(HttpClient);
        const baseUrl = inject(BASE_URL);
        const endpoint = `${baseUrl}${path}`;
        
        // Crear la operación correspondiente
        switch (op) {
          case 'get':
            return new GetOperation<T>(http, endpoint) as OperationMap<T>[Op];
          case 'create':
            return new CreateOperation<T>(http, endpoint) as OperationMap<T>[Op];
          case 'update':
            return new UpdateOperation<T>(http, endpoint) as OperationMap<T>[Op];
          case 'delete':
            return new DeleteOperation<T>(http, endpoint) as OperationMap<T>[Op];
          case 'crud':
          default:
            return new CrudOperation<T>(http, endpoint) as OperationMap<T>[Op];
        }
      }
    }
  );
}
```

### 3. Configuración de la Aplicación

Configura la URL base en `app.config.ts`:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { BASE_URL } from './core/resource-token.factory';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { 
      provide: BASE_URL, 
      useValue: 'https://api.example.com' 
    }
  ]
};
```

### 4. Uso en Slices

Cada feature tiene su archivo slice con interface y token:

#### Ejemplo 1: Solo lectura (Configuración)

```typescript
// features/config/config.slice.ts
import { provideResource } from '../../core/resource-token.factory';

export interface Config {
  id: number;
  theme: string;
  language: string;
}

// ✅ Solo operaciones GET
export const CONFIG_SERVICE = provideResource<Config>('/api/config', 'get');
```

```typescript
// features/config/config.component.ts
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CONFIG_SERVICE, Config } from './config.slice';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (config$ | async; as config) {
      <div>Theme: {{ config.theme }}</div>
      <div>Language: {{ config.language }}</div>
    }
  `
})
export class ConfigComponent {
  private configService = inject(CONFIG_SERVICE);
  
  config$ = this.configService.getAll();
  
  // ❌ TypeScript error: Property 'create' does not exist
  // this.configService.create({});
}
```

#### Ejemplo 2: Solo creación (Logs)

```typescript
// features/logs/log.slice.ts
import { provideResource } from '../../core/resource-token.factory';

export interface Log {
  message: string;
  level: 'info' | 'error' | 'warning';
  timestamp: Date;
}

// ✅ Solo operación CREATE
export const LOG_SERVICE = provideResource<Log>('/api/logs', 'create');
```

```typescript
// features/logs/logger.service.ts
import { Injectable, inject } from '@angular/core';
import { LOG_SERVICE, Log } from './log.slice';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logService = inject(LOG_SERVICE);
  
  logInfo(message: string) {
    this.logService.create({ 
      message, 
      level: 'info', 
      timestamp: new Date() 
    }).subscribe();
  }
  
  logError(message: string) {
    this.logService.create({ 
      message, 
      level: 'error', 
      timestamp: new Date() 
    }).subscribe();
  }
  
  // ❌ TypeScript error: Property 'getAll' does not exist
  // this.logService.getAll();
}
```

#### Ejemplo 3: Lectura + Actualización (Perfil de usuario)

```typescript
// features/profile/user-profile.slice.ts
import { provideResource } from '../../core/resource-token.factory';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// ✅ Operaciones GET + UPDATE (pero no DELETE ni CREATE)
export const USER_PROFILE_SERVICE = provideResource<UserProfile>('/api/profile', 'update');
```

```typescript
// features/profile/user-profile.component.ts
import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { USER_PROFILE_SERVICE, UserProfile } from './user-profile.slice';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  template: `
    @if (profile$ | async; as profile) {
      <form (ngSubmit)="updateProfile(profile)">
        <input [(ngModel)]="profile.name" name="name">
        <input [(ngModel)]="profile.email" name="email">
        <button type="submit">Save</button>
      </form>
    }
  `
})
export class UserProfileComponent {
  private profileService = inject(USER_PROFILE_SERVICE);
  
  profile$ = this.profileService.getById(1);
  
  updateProfile(profile: UserProfile) {
    this.profileService.update(profile.id, profile).subscribe({
      next: () => console.log('Profile updated'),
      error: (err) => console.error('Error:', err)
    });
  }
  
  // ✅ Tiene: getAll(), getById(), update(), patch()
  // ❌ No tiene: create(), delete()
}
```

#### Ejemplo 4: CRUD completo (Gestión de usuarios - Admin)

```typescript
// features/users/users.slice.ts
import { provideResource } from '../../core/resource-token.factory';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// ✅ CRUD completo (por defecto)
export const USER_SERVICE = provideResource<User>('/api/users');
// Equivalente a: provideResource<User>('/api/users', 'crud')
```

```typescript
// features/users/user-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { USER_SERVICE, User } from './users.slice';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <button (click)="createUser()">New User</button>
    
    @for (user of users$ | async; track user.id) {
      <div class="user-card">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <button (click)="editUser(user)">Edit</button>
        <button (click)="deleteUser(user.id)">Delete</button>
      </div>
    }
  `
})
export class UserListComponent {
  private userService = inject(USER_SERVICE);
  
  users$ = this.userService.getAll();
  
  createUser() {
    const newUser: Partial<User> = {
      name: 'New User',
      email: 'newuser@example.com',
      role: 'user'
    };
    
    this.userService.create(newUser).subscribe({
      next: (user) => console.log('User created:', user),
      error: (err) => console.error('Error:', err)
    });
  }
  
  editUser(user: User) {
    const updated = { ...user, name: user.name + ' (edited)' };
    
    this.userService.update(user.id, updated).subscribe({
      next: () => console.log('User updated'),
      error: (err) => console.error('Error:', err)
    });
  }
  
  deleteUser(id: number) {
    if (confirm('Are you sure?')) {
      this.userService.delete(id).subscribe({
        next: () => console.log('User deleted'),
        error: (err) => console.error('Error:', err)
      });
    }
  }
  
  // ✅ Tiene todas las operaciones: getAll(), getById(), create(), update(), patch(), delete()
}
```

## Ejemplos de Uso

### Comparación de operaciones disponibles

```typescript
// Solo GET
const configService = inject(CONFIG_SERVICE);
configService.getAll();     // ✅
configService.getById(1);   // ✅
configService.create({});   // ❌ Error de TypeScript

// Solo CREATE
const logService = inject(LOG_SERVICE);
logService.create({});      // ✅
logService.getAll();        // ❌ Error de TypeScript

// GET + UPDATE
const profileService = inject(USER_PROFILE_SERVICE);
profileService.getAll();    // ✅
profileService.getById(1);  // ✅
profileService.update(1, {}); // ✅
profileService.patch(1, {}); // ✅
profileService.create({});  // ❌ Error de TypeScript
profileService.delete(1);   // ❌ Error de TypeScript

// CRUD completo
const userService = inject(USER_SERVICE);
userService.getAll();       // ✅
userService.getById(1);     // ✅
userService.create({});     // ✅
userService.update(1, {});  // ✅
userService.patch(1, {});   // ✅
userService.delete(1);      // ✅
```

### Compartiendo el mismo recurso con diferentes operaciones

```typescript
// En diferentes partes de la aplicación

// users-readonly.slice.ts
export const USER_READ_SERVICE = provideResource<User>('/api/users', 'get');

// users-admin.slice.ts
export const USER_ADMIN_SERVICE = provideResource<User>('/api/users', 'crud');

// NOTA: Estos son dos InjectionTokens DIFERENTES
// Crean dos instancias singleton INDEPENDIENTES
// No comparten estado (pero no es problema si son stateless)
```

## Ventajas

### 1. Bundle Size Mínimo
- ✅ Una sola clase genérica por tipo de operación
- ✅ Tree-shaking: Si no usas una operación, no se incluye en el bundle
- ✅ No hay repetición de código CRUD

### 2. Type Safety
- ✅ TypeScript impide usar métodos no disponibles
- ✅ Autocomplete correcto en el IDE
- ✅ Errores en tiempo de compilación, no en runtime

### 3. Interface Segregation Principle
- ✅ Los componentes solo acceden a las operaciones que necesitan
- ✅ Componentes de solo lectura no pueden modificar datos
- ✅ Mayor seguridad y claridad de intención

### 4. Singleton Automático
- ✅ `providedIn: 'root'` crea un singleton por token
- ✅ La factory se ejecuta solo una vez
- ✅ No necesitas configurar providers manualmente

### 5. Vertical Slice Architecture
- ✅ Todo en un archivo: interface + token
- ✅ Fácil de entender y mantener
- ✅ Cada feature es independiente

### 6. Flexible y Extensible
- ✅ Fácil añadir métodos custom si es necesario
- ✅ Puedes combinar operaciones según tus necesidades
- ✅ Compatible con interceptors, guards, etc.

## Notas Importantes

### Sobre Singletons y Múltiples Tokens

Cuando usas el mismo path con diferentes operaciones:

```typescript
const USER_GET = provideResource<User>('/api/users', 'get');
const USER_CRUD = provideResource<User>('/api/users', 'crud');
```

Se crean **dos InjectionTokens diferentes** y por tanto **dos instancias singleton independientes**:
- `USER_GET` → Token `"get:/api/users"` → GetOperation instance
- `USER_CRUD` → Token `"crud:/api/users"` → CrudOperation instance

**¿Es esto un problema?**
- ❌ NO, si tus servicios son stateless (solo wrappers de HttpClient)
- ✅ SÍ, si necesitas compartir cache o estado entre operaciones

En la mayoría de casos con servicios HTTP stateless, **no es problema**.

### Sobre el Tree-Shaking

El tree-shaking funciona correctamente:
- Si solo usas `provideResource(..., 'get')`, solo se incluye `GetOperation` en el bundle
- Si usas `provideResource(..., 'crud')`, se incluye `CrudOperation` completa
- Las operaciones no utilizadas se eliminan del bundle final

### Extensión con Métodos Custom

Si necesitas métodos específicos para un recurso:

```typescript
// users.slice.ts
export const USER_SERVICE = provideResource<User>('/api/users', 'crud');

// Crear una función helper
export function useUserService() {
  const service = inject(USER_SERVICE);
  
  return {
    ...service,
    // Método custom
    getUserByEmail(email: string) {
      return inject(HttpClient).get<User>(`/api/users/by-email/${email}`);
    }
  };
}

// Uso en componente
const userService = useUserService();
userService.getAll();
userService.getUserByEmail('test@example.com');
```

### Testing

Para testing, puedes proveer mocks fácilmente:

```typescript
// user-list.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { USER_SERVICE } from './users.slice';
import { of } from 'rxjs';

describe('UserListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: USER_SERVICE,
          useValue: {
            getAll: () => of([{ id: 1, name: 'Test User', email: 'test@example.com' }]),
            create: jasmine.createSpy('create'),
            update: jasmine.createSpy('update'),
            delete: jasmine.createSpy('delete')
          }
        }
      ]
    });
  });
  
  // ... tests
});
```

## Conclusión

Esta arquitectura combina lo mejor de varios patrones:
- **Vertical Slice**: Features auto-contenidas
- **SOLID (ISP)**: Segregación de interfaces
- **DRY**: Sin repetición de código
- **Type-safe**: TypeScript al máximo
- **Performance**: Bundle mínimo + tree-shaking

Ideal para aplicaciones Angular modernas que buscan escalabilidad, mantenibilidad y rendimiento óptimo.
