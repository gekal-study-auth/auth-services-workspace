FROM node:24-alpine AS dependencies
WORKDIR /app
COPY client-app/package.json client-app/package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY client-app ./
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder --chown=nextjs:nextjs /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/.next ./.next
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
