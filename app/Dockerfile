FROM node:14

ARG PROXY
ENV HTTPS_PROXY ${PROXY}

WORKDIR /usr/src/app

COPY ./app/app /usr/src/app
ENV npm config -g set https-proxy ${HTTPS_PROXY}
RUN npm ci
RUN npm run build
RUN npm run watch &
