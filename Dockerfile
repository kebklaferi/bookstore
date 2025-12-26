# ---------- FRONTEND BUILD ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Kopiraj celoten frontend projekt in build
COPY client .
RUN npm ci
RUN npm run build

# ---------- BACKEND BUILD ----------
FROM node:20-alpine

# nastavimo delovno mapo znotraj node containerja
WORKDIR /app/server

# Backend dependencies
# kopira samo package.json in package-lock.json iz backend mape v container
# pomembno za caching: če se dependencies ne spremenijo, Docker ne bo ponavljal npm ci, 
# layer cache se uporabi
# ne kopira celotnega source → hitrejši build
COPY server/package*.json .
RUN npm ci --only=production

# Backend source iz folderja server
# server/ da kopiramo samo datoteke znotraj
COPY server/ .

# Frontend build → backend public folder
COPY --from=frontend-builder /app/client/dist ./public

# Nastavimo production env
# Nastavi environment variable znotraj containerja
# dostopno z process.env.NODE_ENV v node aplikaciji
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
