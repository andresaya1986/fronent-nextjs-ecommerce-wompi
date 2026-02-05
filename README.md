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
