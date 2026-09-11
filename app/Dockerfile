FROM node:24-alpine AS base

# create destination directory
RUN mkdir -p /usr/src/ionic-app
WORKDIR /usr/src/ionic-app

# install deps & CLI
COPY package*.json /usr/src/ionic-app/
RUN npm install -g @ionic/cli

# copy the app, note .dockerignore
COPY ./ /usr/src/ionic-app/

FROM base AS dev
#ENV NODE_ENV=development
# development (default) targets preprod, local targets traefik.me
RUN npm install --legacy-peer-deps
EXPOSE 8100 24678
# NB. --external exposes not only on localhost as needed on docker,
# see https://stackoverflow.com/questions/58976530/cant-access-ionic-from-browser-while-using-docker
# PLUS requires in angular.json (else web error Invalid Host header) :
# "serve": { "builder": "@angular-devkit/build-angular:dev-server", "options": { "allowedHosts": ["all"],
# see various : https://nx.dev/nx-api/angular/executors/dev-server https://webpack.js.org/configuration/dev-server/ https://github.com/webpack/webpack/discussions/18293
##CMD ionic serve --configuration ${IONIC_SERVE_CONFIGURATION} --external
# NODE_ENV allows to load (../app/!).env.<NODE_ENV>
#CMD NODE_ENV=preprod ionic serve --host=0.0.0.0
# 20250324 works in dev :
CMD ionic serve --host=0.0.0.0

FROM base AS build-preprod
# clean install & (not prod) build :
##RUN npm ci
RUN npm install --legacy-peer-deps
# how to pass each env's vars - 3 alternatives solutions :
# https://stackoverflow.com/questions/77486735/docker-with-vite-env-variables-are-undefined-inside-the-docker-container
# 1. define a build argument for each env var, fill it in docker compose yml
# (in build.args), and init docker process env var from it :
ARG VITE_BASE
ENV VITE_BASE=$VITE_BASE
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
RUN ionic build
# 2. define env vars in .env.<NODE_ENV> files, load them in vite.config.js,
# and specify NODE_ENV before building :
# ( as in vite ex. https://stackoverflow.com/questions/78652130/how-to-use-different-env-files-for-different-environments-in-vitejs-react )
#ARG NODE_ENV
##ENV NODE_ENV=$NODE_ENV
#RUN NODE_ENV=$NODE_ENV ionic build
# BUT then env vars have to be written in 2 different places
# AND both imply a different image for each environment...
# 3. so the only way not to : replace env vars at container start
# (or use them from an imported js file generated at container start,
# maybe more leaky, but all solutions are anyway)
# https://dev.to/sanjayttg/dynamic-environment-variables-for-dockerized-react-apps-5bc5

FROM nginx:alpine AS preprod
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-preprod /usr/src/ionic-app/dist/ /usr/share/nginx/html/
COPY .docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]
# as at https://github.com/letnull19A/nginx_vite_react_docker/blob/main/Dockerfile

FROM base AS build-production
ARG VITE_BASE
ENV VITE_BASE=$VITE_BASE
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
# clean install & prod build :
##RUN npm ci
RUN npm install --legacy-peer-deps
RUN ionic build --prod

FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-production /usr/src/ionic-app/dist/ /usr/share/nginx/html/
COPY .docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]
# as at https://github.com/letnull19A/nginx_vite_react_docker/blob/main/Dockerfile
