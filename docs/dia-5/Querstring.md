# Guía: Enviar Query Strings en Angular HTTP

Esta guía te muestra todas las formas de enviar parámetros de URL (query strings) en peticiones HTTP con Angular.

## Requisitos Previos

Asegúrate de tener `HttpClientModule` importado en tu módulo:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule]
})
export class AppModule { }
```

## 1. Usando HttpParams (Método Recomendado)

La clase `HttpParams` es la forma más segura y flexible de trabajar con query strings.

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private http: HttpClient) {}

  obtenerUsuarios() {
    const params = new HttpParams()
      .set('nombre', 'Juan')
      .set('edad', '25')
      .set('ciudad', 'Madrid');

    return this.http.get('https://api.ejemplo.com/usuarios', { params });
    // URL: https://api.ejemplo.com/usuarios?nombre=Juan&edad=25&ciudad=Madrid
  }
}
```

### Características de HttpParams

- Es **inmutable**: cada método devuelve una nueva instancia
- Codifica automáticamente los valores (URL encoding)
- Maneja correctamente caracteres especiales

## 2. Desde un Objeto con fromObject

Ideal cuando tienes todos los parámetros en un objeto:

```typescript
obtenerUsuariosFiltrados() {
  const params = new HttpParams({ 
    fromObject: {
      nombre: 'Juan',
      edad: '25',
      ciudad: 'Madrid',
      activo: 'true'
    }
  });

  return this.http.get('https://api.ejemplo.com/usuarios', { params });
}
```

## 3. Pasando Objeto Directamente (Más Simple)

Angular permite pasar un objeto simple directamente:

```typescript
buscarUsuarios() {
  const params = {
    nombre: 'Juan',
    edad: '25',
    ciudad: 'Madrid'
  };

  return this.http.get('https://api.ejemplo.com/usuarios', { params });
}
```

**Ventaja**: Código más limpio y conciso

**Desventaja**: Menos control sobre la codificación de caracteres especiales

## 4. Parámetros Condicionales

Cuando algunos parámetros son opcionales:

```typescript
buscarConFiltros(filtros: any) {
  let params = new HttpParams();

  if (filtros.nombre) {
    params = params.set('nombre', filtros.nombre);
  }
  
  if (filtros.edad) {
    params = params.set('edad', filtros.edad.toString());
  }

  if (filtros.ciudad) {
    params = params.set('ciudad', filtros.ciudad);
  }

  return this.http.get('https://api.ejemplo.com/usuarios', { params });
}
```

## 5. Múltiples Valores para el Mismo Parámetro

Cuando necesitas enviar arrays (como `?tags=javascript&tags=angular&tags=typescript`):

```typescript
buscarPorTags() {
  let params = new HttpParams();
  const tags = ['javascript', 'angular', 'typescript'];

  tags.forEach(tag => {
    params = params.append('tags', tag);
  });

  return this.http.get('https://api.ejemplo.com/articulos', { params });
  // URL: https://api.ejemplo.com/articulos?tags=javascript&tags=angular&tags=typescript
}
```

## 6. Parámetros Dinámicos desde Formulario

Ejemplo completo en un componente:

```typescript
import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-busqueda',
  template: `
    <input [(ngModel)]="termino" placeholder="Buscar...">
    <button (click)="buscar()">Buscar</button>
  `
})
export class BusquedaComponent {
  termino: string = '';
  
  constructor(private http: HttpClient) {}

  buscar() {
    const params = new HttpParams()
      .set('q', this.termino)
      .set('limit', '10')
      .set('offset', '0');

    this.http.get('https://api.ejemplo.com/buscar', { params })
      .subscribe(resultados => {
        console.log(resultados);
      });
  }
}
```

## 7. Ejemplo Completo con Servicio

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface FiltrosUsuario {
  nombre?: string;
  edad?: number;
  ciudad?: string;
  activo?: boolean;
  pagina?: number;
  limite?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://api.ejemplo.com/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(filtros: FiltrosUsuario): Observable<any> {
    let params = new HttpParams();

    // Agregar solo los filtros que tengan valor
    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }

    if (filtros.edad !== undefined) {
      params = params.set('edad', filtros.edad.toString());
    }

    if (filtros.ciudad) {
      params = params.set('ciudad', filtros.ciudad);
    }

    if (filtros.activo !== undefined) {
      params = params.set('activo', filtros.activo.toString());
    }

    // Paginación
    params = params.set('pagina', (filtros.pagina || 1).toString());
    params = params.set('limite', (filtros.limite || 20).toString());

    return this.http.get(this.apiUrl, { params });
  }
}
```

## 8. Manejo de Caracteres Especiales

`HttpParams` maneja automáticamente la codificación:

```typescript
buscarConCaracteresEspeciales() {
  const params = new HttpParams()
    .set('busqueda', 'Angular & React')
    .set('email', 'usuario@ejemplo.com');

  return this.http.get('https://api.ejemplo.com/buscar', { params });
  // URL: https://api.ejemplo.com/buscar?busqueda=Angular%20%26%20React&email=usuario%40ejemplo.com
}
```

## 9. Todos los Métodos HTTP

Los query strings funcionan con todos los métodos HTTP:

```typescript
// GET
this.http.get(url, { params });

// DELETE
this.http.delete(url, { params });

// POST (menos común con query strings)
this.http.post(url, body, { params });

// PUT
this.http.put(url, body, { params });

// PATCH
this.http.patch(url, body, { params });
```

## Buenas Prácticas

1. **Usa HttpParams para mayor seguridad**: Maneja automáticamente la codificación
2. **Recuerda que HttpParams es inmutable**: Siempre reasigna el valor
3. **Valida los parámetros**: Verifica que no sean null o undefined antes de agregarlos
4. **Usa interfaces**: Define tipos para tus filtros y parámetros
5. **Centraliza en servicios**: No hagas peticiones HTTP directamente en componentes

## Errores Comunes

### Error 1: No reasignar HttpParams

```typescript
// ❌ INCORRECTO
let params = new HttpParams();
params.set('nombre', 'Juan'); // No hace nada, params sigue vacío

// ✅ CORRECTO
let params = new HttpParams();
params = params.set('nombre', 'Juan');
```

### Error 2: Pasar números sin convertir a string

```typescript
// ❌ INCORRECTO
params = params.set('edad', 25); // Error de tipo

// ✅ CORRECTO
params = params.set('edad', '25');
// o
params = params.set('edad', edad.toString());
```

## Recursos Adicionales

- [Documentación oficial de Angular HttpClient](https://angular.io/guide/http)
- [API de HttpParams](https://angular.io/api/common/http/HttpParams)

---


**Compatible con**: Angular 12+
