FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN corepack enable && yarn install --non-interactive
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh","-c","npx prisma generate && npx prisma migrate deploy && node dist/src/main.js"]