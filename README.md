# FinanzasGD - Gestor de Finanzas Personales

Este proyecto forma parte de la entrega del final del módulo de desarrollo frontend (Hackaton 2026).

---

## Tecnologías y Librerías Utilizadas

* **HTML5 & CSS3:** Estructura semántica y diseño adaptativo.
* **Tailwind CSS (v4 CLI):** Framework de clases utilitarias para un diseño moderno, limpio y completamente responsivo (*Mobile-First*).
* **Vanilla JavaScript (ES6+ Modules):** Lógica del cliente basada en **Programación Orientada a Objetos (POO)** con uso de clases, métodos estáticos, bloques de inicialización estática y encapsulamiento privado.
* **LocalStorage:** Persistencia de datos nativa en el navegador del usuario.
* **Chart.js:** Librería externa basada en CDN para la representación visual de datos (Gráfico de barras por categoría y gráfico de líneas de evolución temporal).
* **Day.js:** Librería ligera para el formateo, manipulación y visualización de fechas en formato local (`DD/MM/YYYY`).
* **FontAwesome:** Iconografía moderna para la interfaz de usuario.

---

## Para iniciar el proyecto localmente

1. **Clonar el repositorio:**
```Bash
   git clone [https://github.com/juan-pablo-lujan/gestor-finanzas-iefi.git](https://github.com/juan-pablo-lujan/gestor-finanzas-iefi.git)
```

2. Acceder al directorio del proyecto:

```Bash
cd gestor-finanzas-iefi
```

3. Instalar las dependencias (Tailwind CLI):

```Bash
npm install
```

4. Para editar y modificar estilo, iniciar el compilador de Tailwind CSS (en modo watch):
```Bash
npm run tailwind
```
(Deja esta terminal abierta para que compile los cambios de estilo en tiempo real).

Abrir la aplicación:

5. Abrir el archivo "index.html" directamente en el navegador, o utiliza una extensión de desarrollo como Live Server en Visual Studio Code para una mejor experiencia en local.