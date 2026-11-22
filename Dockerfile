# Image Docker autonome (Coolify / VPS)
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

# NEXT_PUBLIC_* est inliné au build. Pas de vraie DB pendant le build.
ARG NEXT_PUBLIC_SITE_URL=https://communaute.bapa-officiel.com
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    AUTH_URL=$NEXT_PUBLIC_SITE_URL \
    AUTH_SECRET=build-only-placeholder-not-used-at-runtime \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S nodejs && adduser -S nextjs -G nodejs
# Coolify route par défaut vers 3000
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Query engine + CLI (standalone n'embarque pas toujours les binaires Alpine)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-start.sh ./docker-start.sh
RUN chmod +x /app/docker-start.sh
USER nextjs
EXPOSE 3000
CMD ["sh", "/app/docker-start.sh"]
