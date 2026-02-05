FROM node:18-alpine AS base
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
# install full deps for build (includes tailwind/postcss)
RUN npm install

# copy source and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app .
EXPOSE 3000
CMD ["npm", "run", "start"]
