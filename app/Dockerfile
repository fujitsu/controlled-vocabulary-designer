FROM node:18

ARG SPROXY
ENV HTTPS_PROXY ${SPROXY}

WORKDIR /usr/src/app

COPY ./app/app /usr/src/app
ENV npm config -g set https-proxy ${HTTPS_PROXY}
RUN npm install -g npm@9.1.3
RUN npm install
# RUN npm ci
RUN npm run build
RUN npm run watch &
