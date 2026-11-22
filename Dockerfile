# Alternative à PM2 : image Docker autonome
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Coolify injecte ces build-args ; NEXT_PUBLIC_* doit être dispo au build Next
ARG NEXT_PUBLIC_SITE_URL
ARG AUTH_URL
ARG AUTH_SECRET
ARG DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    AUTH_URL=$AUTH_URL \
    AUTH_SECRET=$AUTH_SECRET \
    DATABASE_URL=$DATABASE_URL

RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S nodejs && adduser -S nextjs -G nodejs
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3005 HOSTNAME=0.0.0.0
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
EXPOSE 3005
CMD ["node", "server.js"]
