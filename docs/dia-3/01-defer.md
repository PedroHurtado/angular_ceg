# Guía de @defer en Angular: Lazy Loading y Accesibilidad

## Introducción

El bloque `@defer` en Angular permite cargar componentes de forma diferida (lazy loading), mejorando el rendimiento inicial de la aplicación. Esta guía explica cómo funciona, por qué el `@placeholder` es necesario en ciertos casos, y cómo aprovecharlo para mejorar la accesibilidad.

## ¿Qué es @defer?

`@defer` es una característica de Angular (17+) que permite cargar componentes bajo demanda, reduciendo el tamaño del bundle inicial.

### Ejemplo básico

```typescript
@defer (on viewport) {
  <app-postcoments />
}
@loading {
  <div>Cargando...</div>
}
@error {
  <div>Error al cargar</div>
}
@placeholder {
  <div>Comentarios del post</div>
}
```

## El rol del @placeholder

### ¿Es obligatorio?

El `@placeholder` **no siempre es obligatorio**, pero sí lo es cuando usas ciertos triggers:

**Obligatorio con:**
- `on viewport` - necesita un elemento para observar
- `on interaction` - necesita un elemento con el que interactuar  
- `on hover` - necesita un elemento sobre el que hacer hover

**Opcional con:**
- `on idle` - carga cuando el navegador está inactivo
- `on timer(Xs)` - carga después de X segundos
- `on immediate` - carga inmediatamente
- Sin trigger específico - se comporta como `on idle`

### ¿Por qué es necesario?

El placeholder actúa como un **ancla o marcador** en el DOM que Angular utiliza para:

1. **Saber DÓNDE insertar** el componente una vez cargado
2. **Observar eventos** (viewport, hover, clicks)
3. **Reservar espacio** antes de que el componente real esté disponible

**Flujo de trabajo:**

```
1. Angular renderiza el @placeholder → hay un elemento en el DOM
2. Adjunta un observer (ej: IntersectionObserver) → vigila ese elemento  
3. Detecta el trigger → "¡el placeholder entró al viewport!"
4. Hace lazy load del componente → descarga el código JS
5. Reemplaza el placeholder con el componente → swap en el mismo lugar
```

## Code Splitting: ¿Cómo funciona internamente?

### El "problema" del import

Cuando usas `@defer`, debes importar el componente en los imports:

```typescript
import { PostcomentsComponent } from './postcoments';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [PostcomentsComponent], // ← Parece que lo carga todo
  template: `
    @defer (on viewport) {
      <app-postcoments />
    }
  `
})
```

**¿Esto no contradice el lazy loading?** ¡NO!

### Angular es inteligente

Angular detecta el `@defer` en tiempo de compilación:

1. Ve el import estático: `import { PostcomentsComponent }`
2. Analiza el template y detecta que está dentro de `@defer`
3. **Convierte automáticamente** el import estático en dynamic import
4. Extrae el código a un **chunk separado**
5. **El código NO está duplicado**

### Verificación

Después de ejecutar `ng build`:

```bash
dist/tu-app/browser/
├── main-[hash].js           # Bundle principal (SIN PostcomentsComponent)
├── chunk-[hash].js          # PostcomentsComponent aquí
├── polyfills-[hash].js
└── ...
```

Puedes verificarlo en DevTools → Network:
- Inicialmente se carga: `main.js` ✅
- Al hacer scroll al viewport: `chunk-[hash].js` ✅

### Comparación con React

```typescript
// React - Manual
const PostComments = lazy(() => import('./PostComments'));

// Angular - Automático
import { PostcomentsComponent } from './postcoments';
// Angular lo transforma en dynamic import automáticamente
```

## Accesibilidad con @placeholder

El placeholder no es solo técnico, es una **oportunidad para mejorar la UX y accesibilidad**.

### 1. Skeleton screens

Muestra una representación visual del contenido que se cargará:

```typescript
@placeholder {
  <div class="comments-skeleton" aria-label="Sección de comentarios">
    <div class="skeleton-comment"></div>
    <div class="skeleton-comment"></div>
    <div class="skeleton-comment"></div>
  </div>
}
```

**CSS para skeleton:**

```css
.skeleton-comment {
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 16px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 2. Atributos ARIA apropiados

```typescript
@placeholder {
  <div 
    role="region"
    aria-labelledby="comments-heading"
    aria-busy="true">
    <h3 id="comments-heading" class="sr-only">
      Comentarios del post
    </h3>
    <p>Los comentarios se cargarán al hacer scroll</p>
  </div>
}
```

**Atributos clave:**
- `role="region"` - define una sección significativa
- `aria-labelledby` - conecta con un encabezado descriptivo
- `aria-busy="true"` - indica que el contenido está cargándose
- `class="sr-only"` - oculta visualmente pero accesible para lectores

### 3. Estados de carga y error accesibles

```typescript
@defer (on viewport) {
  <app-postcoments />
}

@placeholder {
  <section 
    role="region"
    aria-labelledby="comments-heading"
    class="comments-placeholder">
    <h3 id="comments-heading" class="sr-only">
      Comentarios del post
    </h3>
    <div class="skeleton-container">
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    </div>
  </section>
}

@loading (minimum 500ms) {
  <div role="status" aria-live="polite" aria-atomic="true">
    <span>Cargando comentarios...</span>
    <div class="spinner" aria-hidden="true"></div>
  </div>
}

@error {
  <div role="alert" aria-live="assertive">
    <p>No se pudieron cargar los comentarios</p>
    <button type="button" (click)="retry()">
      Reintentar
    </button>
  </div>
}
```

**Atributos para estados:**
- `role="status"` - información de estado no crítica
- `role="alert"` - mensajes importantes/errores
- `aria-live="polite"` - anuncia cambios cuando sea apropiado
- `aria-live="assertive"` - anuncia cambios inmediatamente
- `aria-atomic="true"` - lee todo el contenido, no solo cambios

### 4. Prevenir Cumulative Layout Shift (CLS)

Reserva espacio para evitar saltos en el layout:

```typescript
@placeholder {
  <div 
    style="min-height: 400px"
    class="comments-placeholder"
    aria-label="Comentarios del post">
    <div class="placeholder-content">
      💬 <strong>Comentarios</strong>
      <p>Se cargarán al hacer scroll</p>
    </div>
  </div>
}
```

```css
.comments-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
```

## Ejemplo completo: Post con comentarios

```typescript
import { Component } from '@angular/core';
import { PostcomentsComponent } from './postcoments/postcoments.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [PostcomentsComponent],
  template: `
    <article class="post">
      <header>
        <h2>{{ title }}</h2>
        <p>{{ content }}</p>
      </header>

      @defer (on viewport) {
        <app-postcoments [postId]="postId" />
      }
      
      @placeholder {
        <section 
          role="region"
          aria-labelledby="comments-heading"
          class="comments-placeholder">
          <h3 id="comments-heading" class="sr-only">
            Sección de comentarios
          </h3>
          <div class="skeleton-container">
            <div class="skeleton-header"></div>
            <div class="skeleton-comment"></div>
            <div class="skeleton-comment"></div>
            <div class="skeleton-comment"></div>
          </div>
        </section>
      }
      
      @loading (minimum 500ms) {
        <div 
          class="loading-state"
          role="status" 
          aria-live="polite">
          <span>Cargando comentarios...</span>
          <div class="spinner" aria-hidden="true"></div>
        </div>
      }
      
      @error {
        <div 
          class="error-state"
          role="alert" 
          aria-live="assertive">
          <p>Error al cargar los comentarios</p>
          <button type="button" (click)="retryLoadComments()">
            Reintentar
          </button>
        </div>
      }
    </article>
  `,
  styles: [`
    .comments-placeholder {
      min-height: 400px;
      padding: 24px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-top: 32px;
    }

    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .skeleton-header {
      height: 40px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
      width: 200px;
    }

    .skeleton-comment {
      height: 80px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .loading-state,
    .error-state {
      padding: 48px;
      text-align: center;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state button {
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .error-state button:hover {
      background: #2980b9;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class PostComponent {
  title = 'Mi primer post';
  content = 'Este es el contenido del post...';
  postId = 123;

  retryLoadComments() {
    // Lógica para reintentar carga
    window.location.reload();
  }
}
```

## Beneficios para la accesibilidad

✅ **Lectores de pantalla** - informados del estado de carga  
✅ **Navegación por teclado** - todos los elementos son accesibles  
✅ **Usuarios con motion sickness** - transiciones suaves con skeletons  
✅ **SEO** - contenido indexable en el placeholder  
✅ **Core Web Vitals** - mejor CLS (sin saltos de layout)  
✅ **Conexiones lentas** - feedback visual inmediato  
✅ **Usuarios con discapacidad visual** - anuncios claros de cambios de estado

## Mejores prácticas

### 1. Usa minimum en @loading

```typescript
@loading (minimum 500ms) {
  // Evita flashes si la carga es muy rápida
}
```

### 2. Proporciona altura mínima

```typescript
@placeholder {
  <div style="min-height: 400px">
    <!-- Previene CLS -->
  </div>
}
```

### 3. Siempre incluye @error

```typescript
@error {
  <div role="alert">
    <!-- Manejo de errores accesible -->
  </div>
}
```

### 4. Usa semantic HTML

```html
<section>, <article>, <aside>
<!-- En lugar de solo <div> -->
```

### 5. Textos para screen readers

```html
<span class="sr-only">Texto descriptivo</span>
```

## Herramientas para verificar accesibilidad

- **axe DevTools** - extensión de Chrome/Firefox
- **WAVE** - evaluador de accesibilidad web
- **Lighthouse** - auditoría integrada en Chrome DevTools
- **NVDA/JAWS** - lectores de pantalla para pruebas

## Recursos adicionales

- [Angular Docs - @defer](https://angular.dev/guide/defer)
- [MDN - ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [Web.dev - Accessibility](https://web.dev/accessibility/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Conclusión

El `@defer` de Angular no es solo una herramienta de optimización de rendimiento, sino también una oportunidad para crear experiencias más accesibles e inclusivas. El `@placeholder` es el puente entre el lazy loading técnico y una experiencia de usuario de alta calidad para todos los usuarios, independientemente de sus capacidades o conexión a internet.

---

