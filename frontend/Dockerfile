
# Étape 1 : Utiliser une image de base Node.js
FROM node:20-alpine AS build-stage
# FROM node:18 AS build-stage

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Debug
RUN echo "VITE_API_URL during build $VITE_API_URL"

# Étape 3 : Copier les fichiers de dépendances
COPY package.json yarn.lock ./

# Étape 4 : Installer les dépendances
RUN yarn install --frozen-lockfile

# Étape 5 : Copier le reste des fichiers du projet
COPY . .

# Étape 6 : Builder l'application
RUN yarn build

# Étape 7 : Utiliser une image Nginx pour servir les fichiers statiques
FROM nginx:alpine
# FROM nginx:alpine AS production

# Étape 8 : Copier les fichiers buildés de l'étape précédente
COPY --from=build-stage /app/dist /usr/share/nginx/html

# ✨ AJOUTER CETTE LIGNE ✨
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Étape 9 : Exposer le port 80
EXPOSE 80

# Étape 10 : Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
