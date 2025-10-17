# Interceptores de Angular

## ¿Qué son?

Los interceptores son middleware que permiten ejecutar lógica común para cada petición HTTP, como autenticación, caché, logging y reintentos. Se ejecutan antes de que la petición llegue al servidor y después de que llegue la respuesta.

## Tipos de Interceptores

Angular soporta dos tipos:
- **Funcionales** (recomendados): Más predecibles y sencillos
- **Basados en DI**: Clases inyectables, más complejos de configurar

## Interceptor Funcional Básico

```typescript
export function loggingInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

**Parámetros:**
- `req`: La petición HTTP saliente
- `next`: Función que pasa la petición al siguiente interceptor en la cadena

## Configuración

Se configuran en el bootstrap de la aplicación:

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor, cachingInterceptor])
    )
  ]
});
```

Los interceptores se ejecutan en el orden en que se declaran.

## Casos de Uso Comunes

- Agregar headers de autenticación
- Reintentar peticiones fallidas con backoff exponencial
- Cachear respuestas
- Personalizar el parsing de respuestas
- Medir tiempos de respuesta y hacer logging
- Mostrar spinners de carga
- Agrupar peticiones en lotes
- Implementar timeouts automáticos
- Polling periódico al servidor

## Interceptar Respuestas

Para trabajar con respuestas, se transforma el stream Observable:

```typescript
export function loggingInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        console.log(req.url, 'status:', event.status);
      }
    })
  );
}
```

## Modificar Peticiones

Las peticiones son inmutables. Para modificarlas, se usa `.clone()`:

```typescript
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'valor')
});
```

## Inyección de Dependencias

Los interceptores pueden inyectar servicios usando `inject()`:

```typescript
export function authInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) {
  const authToken = inject(AuthService).getAuthToken();
  
  const newReq = req.clone({
    headers: req.headers.append('X-Authentication-Token', authToken)
  });
  
  return next(newReq);
}
```

## Contexto de Petición (Metadata)

Permite pasar información entre interceptores sin enviarla al backend:

### Definir un token de contexto:
```typescript
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

### Leerlo en un interceptor:
```typescript
export function cachingInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) {
  if (req.context.get(CACHING_ENABLED)) {
    // aplicar lógica de caché
  }
  return next(req);
}
```

### Establecerlo al hacer la petición:
```typescript
const data$ = http.get('/data', {
  context: new HttpContext().set(CACHING_ENABLED, false)
});
```

**Importante:** El contexto es mutable, útil para pasar estado entre reintentos.

## Respuestas Sintéticas

Los interceptores pueden crear respuestas sin llamar a `next()`:

```typescript
const resp = new HttpResponse({
  body: 'response body'
});
```

Útil para servir respuestas desde caché u otras fuentes.

## Información de Redirecciones

Con `withFetch`, las respuestas incluyen una propiedad `redirected`:

```typescript
export function redirectTrackingInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) {
  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response && event.redirected) {
        console.log('Redirigido a', event.url);
      }
    })
  );
}
```

## Ejemplo: Manejo de Errores HTTP

Interceptor que relanza excepciones para códigos de estado entre 400 y 600:

```typescript
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

export function errorHandlerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap(event => {
      // Verificar respuestas exitosas con códigos de error
      if (event.type === HttpEventType.Response) {
        if (event.status >= 400 && event.status < 600) {
          throw new HttpErrorResponse({
            error: event.body,
            headers: event.headers,
            status: event.status,
            statusText: event.statusText,
            url: event.url || req.url
          });
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Manejar errores HTTP
      if (error.status >= 400 && error.status < 600) {
        console.error('Error HTTP detectado:', {
          url: req.url,
          status: error.status,
          message: error.message
        });
        
        // Personalizar el mensaje según el rango de error
        let customMessage = '';
        if (error.status >= 400 && error.status < 500) {
          customMessage = 'Error del cliente: Verifica los datos enviados';
        } else if (error.status >= 500 && error.status < 600) {
          customMessage = 'Error del servidor: Intenta más tarde';
        }
        
        // Relanzar la excepción con información adicional
        return throwError(() => new Error(
          `${customMessage} (${error.status}: ${error.statusText})`
        ));
      }
      
      // Para otros errores, relanzar tal cual
      return throwError(() => error);
    })
  );
}
```

**Uso del interceptor:**

```typescript
// Configuración
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([errorHandlerInterceptor])
    )
  ]
});

// En un componente o servicio
this.http.get('/api/data').subscribe({
  next: (data) => console.log('Datos:', data),
  error: (error) => {
    // Aquí llegarán los errores procesados por el interceptor
    console.error('Error capturado:', error.message);
    // Mostrar al usuario, enviar a un servicio de logging, etc.
  }
});
```

**Variante simplificada:**

Si solo necesitas relanzar el error sin procesamiento adicional:

```typescript
export function simpleErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 400 && error.status < 600) {
        console.error(`Error ${error.status} en ${req.url}`);
      }
      return throwError(() => error);
    })
  );
}
```

## Interceptores Basados en DI

Son clases inyectables (no recomendados por su complejidad):

```typescript
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler) {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

**Configuración:**
```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true}
  ]
});
```

## Aplicar Interceptores Selectivamente

Aunque todos los interceptores configurados se ejecutan para todas las peticiones, puedes usar **tokens de contexto** para controlar su comportamiento en peticiones específicas:

### Crear un token para habilitar/deshabilitar el interceptor:

```typescript
// Definir el token
export const ENABLE_ERROR_HANDLER = new HttpContextToken<boolean>(() => true);

// Interceptor que respeta el token
export function errorHandlerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  // Verificar si el interceptor está habilitado para esta petición
  if (!req.context.get(ENABLE_ERROR_HANDLER)) {
    // Si está deshabilitado, pasar la petición sin procesar
    return next(req);
  }
  
  // Si está habilitado, aplicar la lógica del interceptor
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 400 && error.status < 600) {
        console.error(`Error ${error.status} en ${req.url}`);
      }
      return throwError(() => error);
    })
  );
}
```

### Deshabilitar el interceptor para peticiones específicas:

```typescript
// Esta petición NO será procesada por el errorHandlerInterceptor
this.http.get('/api/optional-data', {
  context: new HttpContext().set(ENABLE_ERROR_HANDLER, false)
}).subscribe({
  next: (data) => console.log(data),
  error: (error) => {
    // Manejar el error sin el procesamiento del interceptor
  }
});

// Esta petición SÍ será procesada (valor por defecto es true)
this.http.get('/api/important-data').subscribe({
  next: (data) => console.log(data),
  error: (error) => {
    // Error procesado por el interceptor
  }
});
```

### Ejemplo con múltiples configuraciones:

```typescript
// Tokens para diferentes interceptores
export const ENABLE_CACHING = new HttpContextToken<boolean>(() => true);
export const ENABLE_AUTH = new HttpContextToken<boolean>(() => true);
export const ENABLE_LOGGING = new HttpContextToken<boolean>(() => false);

// Petición con configuración específica
this.http.post('/api/public-action', data, {
  context: new HttpContext()
    .set(ENABLE_CACHING, false)  // Sin caché
    .set(ENABLE_AUTH, false)     // Sin autenticación
    .set(ENABLE_LOGGING, true)   // Con logging
}).subscribe();
```

### Patrón de configuración por URL:

```typescript
export const SKIP_ERROR_URLS = new HttpContextToken<string[]>(() => []);

export function errorHandlerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const skipUrls = req.context.get(SKIP_ERROR_URLS);
  
  // Verificar si la URL actual debe omitir el interceptor
  const shouldSkip = skipUrls.some(url => req.url.includes(url));
  
  if (shouldSkip) {
    return next(req);
  }
  
  // Aplicar lógica normal del interceptor
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo de errores...
      return throwError(() => error);
    })
  );
}
```

**Ventajas de este enfoque:**

✅ Los interceptores permanecen configurados globalmente  
✅ Control granular por petición  
✅ No necesitas múltiples instancias de `HttpClient`  
✅ Código más limpio y mantenible  
✅ Flexibilidad para casos específicos

## Puntos Clave

✅ Usar interceptores funcionales (más simples y predecibles)  
✅ Las peticiones y respuestas son inmutables, usar `.clone()`  
✅ Se ejecutan en el orden declarado  
✅ Pueden inyectar servicios con `inject()`  
✅ El contexto permite pasar metadata entre interceptores  
✅ Usar tokens de contexto para controlar interceptores por petición  
⚠️ El cuerpo de petición/respuesta no está protegido contra mutaciones profundas
