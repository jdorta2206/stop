
build# 🎯 STOP Game - Juego de Palabras

Un emocionante juego de palabras donde los jugadores deben escribir palabras que comiencen con una letra específica en diferentes categorías. ¡Solo se aceptan palabras reales!

## 🚀 Características

### ✨ Funcionalidades Principales
- **🎮 Múltiples modos de juego:** Individual vs IA y Multijugador
- **🌍 Soporte multiidioma:** Español, Inglés, Francés, Portugués  
- **🎯 Sistema de validación:** Solo acepta palabras reales del diccionario
- **🏆 Ranking en tiempo real:** Sistema de puntuación y clasificación
- **👥 Salas privadas:** Juega con amigos usando códigos únicos
- **🔊 Efectos de sonido:** Experiencia inmersiva con audio
- **📱 Diseño responsivo:** Funciona en móviles, tablets y escritorio

### 📚 Categorías del Juego
- **🏙️ Lugar:** Países, ciudades, lugares famosos
- **🦁 Animal:** Todo tipo de animales y criaturas
- **👤 Nombre:** Nombres propios de personas
- **🍎 Comida:** Alimentos, bebidas y comestibles
- **🎨 Color:** Todos los colores y tonalidades
- **📦 Objeto:** Cosas, herramientas y objetos diversos
- **®️ Marca:** Nombres de marcas comerciales

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Build Tool:** Next.js
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Deployment:** GitHub Pages

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/stop-game.git
cd stop-game

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev

# Abrir http://localhost:3000 en tu navegador
```

### Construcción para producción

```bash
# Construir la aplicación
pnpm run build
```

## 🎮 Cómo Jugar

1. **🎯 Selecciona el modo:** Individual vs IA o Multijugador
2. **🌍 Elige idioma:** Español, Inglés, Francés o Portugués
3. **🎲 Gira la ruleta:** Obtén una letra aleatoria
4. **✏️ Completa categorías:** Escribe palabras que empiecen con esa letra
5. **⏰ ¡Rápido!:** Tienes tiempo limitado
6. **🏆 Gana puntos:** Solo las palabras reales del diccionario cuentan

### Sistema de Puntuación
- **10 puntos:** Palabra única (solo tú la escribiste)
- **5 puntos:** Palabra compartida (otros también la escribieron)
- **0 puntos:** Palabra inventada o que no empiece con la letra correcta

## 🔧 Configuración de Firebase

Para habilitar autenticación y ranking en tiempo real:

1.  Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2.  Habilita **Authentication** y **Firestore**.
3.  Copia la configuración a `src/lib/firebase-config.ts`.
4.  **Importante:** En la sección de **Authentication**, ve a la pestaña **Settings** -> **Authorized domains**.
5.  Añade el dominio donde desplegarás la aplicación (ej: `juego-stop.netlify.app`) y `localhost` para las pruebas locales.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**¡Diviértete jugando STOP! 🎯🎮**
