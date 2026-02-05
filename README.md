# Wompi Frontend (Next.js)

Este proyecto es un frontend para la prueba de Wompi, construido con Next.js + TypeScript, Redux Toolkit y TailwindCSS.

## Requisitos
- Node 18+
- Docker (opcional)

## Scripts

Development:

```bash
npm install
npm run dev
```

Build + start:

```bash
npm install
npm run build
npm run start
```

Docker (dev):

```bash
docker compose up --build
```

## Conexión con backend
La URL del backend se configura mediante la variable de entorno `NEXT_PUBLIC_API_URL`. Para la prueba del backend provisto la URL (dev) por defecto es `http://localhost:3000/api`.
Si ejecutas el frontend dentro de Docker Compose, `docker-compose.yml` ya configura `NEXT_PUBLIC_API_URL=http://host.docker.internal:3000/api` para que el contenedor del frontend pueda alcanzar el backend ejecutado en la máquina host.

## Modelo de datos (Product)

- `id`: entero
- `title`: string
- `description`: string
- `price`: number (céntavos o unidades según backend)
- `imageUrl`: string (opcional)

Transactions (guardadas en `localStorage` mediante `redux-persist`):

- `id`, `productId`, `amount`, `status`, `createdAt`

## Notas
- La aplicación está diseñada para móvil con una `container-mobile` centrada y anchura máxima de 420px.
- Estado de transacciones persistido en `localStorage`.

## Mejoras y procesos implementados

Estas son las mejoras y procesos añadidos al proyecto durante la última iteración:

- **Modal de Pago (`components/PaymentModal.tsx`)**
	- Se añadió un campo **Teléfono** (`customerPhone`) en el formulario de pago.
	- Inputs con borde y esquinas redondeadas para mejorar la visibilidad y accesibilidad (`border border-gray-300 rounded`).
	- Formato de número de tarjeta agrupado de a 4 dígitos mientras el usuario escribe (ej. `4111 1111 1111 1111`).
	- Formato automático de la fecha de expiración a `MM/YY` y restricción de CVC a dígitos (máx 4).
	- Validaciones de tarjeta implementadas: comprobación Luhn, formato de expiración, y CVC.
	- Flujo de pasos: `form` -> `summary` -> `processing` -> `result` para mejor experiencia de checkout.

- **Transacciones y estado**
	- Las transacciones se crean llamando a la API y luego se almacenan en Redux.
	- Se realiza polling del estado de la transacción hasta que alcanza un estado terminal (por ejemplo `APPROVED`, `DECLINED`, `FAILED`, `CANCELLED`, `EXPIRED`, `ERROR`).
	- El estado de transacciones se persiste en `localStorage` (a través de `redux-persist`) para poder consultar historial en la página de `Transacciones` incluso tras recargar.

- **Comportamiento y UX**
	- Placeholder y ayuda en campos: ejemplo `+57 300 000 0000` para teléfono y `4111 1111 1111 1111` para tarjeta.
	- Mensajes de error amigables para validaciones de formulario.

## Uso con Docker

El proyecto incluye un `Dockerfile` y `docker-compose.yml` para ejecutar el frontend como imagen de producción. Nota importante:

- En este entorno el servicio del frontend escucha internamente en el puerto `3000`, pero el `docker-compose.yml` mapea el puerto `3000` del contenedor al puerto `3001` del host para evitar conflictos cuando ya existe un proceso en `3000`.

Ejemplos de comandos:

```bash
# Ejecutar en desarrollo (local)
npm install
npm run dev

# Build y start (local)
npm install
npm run build
npm run start

# Con Docker (construye y levanta, mapea a localhost:3001)
docker compose up --build
```

Accede al frontend en: http://localhost:3001

## Publicación en GitHub

El repositorio se ha inicializado y se empujó a GitHub como `main` usando el remoto SSH:

```
git remote add origin git@github.com:andresaya1986/fronent-nextjs-ecommerce-wompi.git
git branch -M main
git push -u origin main
```

Si tu entorno no tiene clave SSH configurada, usa la URL HTTPS alternativa:

```
git remote set-url origin https://github.com/andresaya1986/fronent-nextjs-ecommerce-wompi.git
git push -u origin main
```

## Notas finales
- Asegúrate de configurar `NEXT_PUBLIC_API_URL` si ejecutas el frontend fuera de Docker y necesitas apuntar a otro backend.
