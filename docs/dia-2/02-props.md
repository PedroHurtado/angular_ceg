# Patrones de Comunicación en Frameworks Frontend Modernos

## Props: Patrón de Padre a Hijo

El patrón **Props** (properties) es fundamental en los frameworks modernos de frontend. Permite pasar datos de componentes padres a componentes hijos.

### Características Principales

- **Flujo unidireccional**: Los datos fluyen de arriba hacia abajo (padre → hijo)
- **Inmutabilidad**: Los hijos no deben modificar directamente las props recibidas
- **Reactividad**: Cuando las props cambian en el padre, los hijos se actualizan automáticamente

### Implementación por Framework

#### React
```jsx
// Componente Padre
function Padre() {
  return <Hijo nombre="Juan" edad={25} />;
}

// Componente Hijo
function Hijo({ nombre, edad }) {
  return <p>{nombre} tiene {edad} años</p>;
}
```

#### Vue
```vue
<!-- Componente Padre -->
<Hijo nombre="Juan" :edad="25" />

<!-- Componente Hijo -->
<script setup>
defineProps({
  nombre: String,
  edad: Number
})
</script>
```

#### Angular

**Componente Hijo:**
```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hijo',
  template: '<p>{{nombre}} tiene {{edad}} años</p>'
})
export class HijoComponent {
  @Input() nombre!: string;
  @Input() edad!: number;
}
```

**Componente Padre:**
```typescript
@Component({
  selector: 'app-padre',
  template: '<app-hijo [nombre]="nombrePersona" [edad]="25"></app-hijo>'
})
export class PadreComponent {
  nombrePersona = 'Juan';
}
```

**Sintaxis Angular:**
- `[propiedad]="valor"` - Property binding (valores dinámicos)
- `propiedad="texto"` - Valores estáticos

**Comunicación Hijo → Padre:**
```typescript
@Output() eventoClick = new EventEmitter<string>();

enviarDatos() {
  this.eventoClick.emit('datos del hijo');
}
```

---

## Prop Drilling: El Problema

**Prop drilling** ocurre cuando necesitas pasar datos a través de múltiples niveles de componentes intermedios que no necesitan esos datos.

### Ejemplo del Problema

```jsx
// Nivel 1: Tiene los datos
function App() {
  const usuario = { nombre: "Ana", rol: "admin" };
  return <Nivel2 usuario={usuario} />;
}

// Nivel 2: NO usa 'usuario', solo lo pasa
function Nivel2({ usuario }) {
  return <Nivel3 usuario={usuario} />;
}

// Nivel 3: NO usa 'usuario', solo lo pasa
function Nivel3({ usuario }) {
  return <Nivel4 usuario={usuario} />;
}

// Nivel 4: Finalmente usa los datos
function Nivel4({ usuario }) {
  return <p>Bienvenido {usuario.nombre}</p>;
}
```

### Problemas que Causa

1. **Código verboso**: Componentes intermedios declaran props innecesarias
2. **Difícil mantenimiento**: Cambios en la estructura afectan todos los niveles
3. **Acoplamiento**: Componentes intermedios dependen de datos que no usan
4. **Refactorización complicada**: Mover componentes es más difícil

---

## Soluciones al Prop Drilling

### React - Context API

```jsx
const UsuarioContext = createContext();

function App() {
  const usuario = { nombre: "Ana", rol: "admin" };
  return (
    <UsuarioContext.Provider value={usuario}>
      <Nivel2 />
    </UsuarioContext.Provider>
  );
}

function Nivel4() {
  const usuario = useContext(UsuarioContext);
  return <p>Bienvenido {usuario.nombre}</p>;
}
```

### Vue - Provide/Inject

```vue
<!-- Componente padre -->
<script setup>
import { provide } from 'vue';
const usuario = { nombre: "Ana", rol: "admin" };
provide('usuario', usuario);
</script>

<!-- Componente nieto -->
<script setup>
import { inject } from 'vue';
const usuario = inject('usuario');
</script>
```

### Angular - Services con Dependency Injection

```typescript
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  usuario = { nombre: "Ana", rol: "admin" };
}

// En cualquier componente
constructor(private usuarioService: UsuarioService) {}
```

---

## Conclusión

Los frameworks modernos comparten el mismo patrón conceptual para la comunicación entre componentes, aunque con sintaxis diferentes. Todos enfrentan el problema del prop drilling y ofrecen soluciones para gestionar estado global o compartido sin necesidad de pasar props por múltiples niveles intermedios.
