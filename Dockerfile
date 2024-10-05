FROM node:22-alpine3.19 as BUILD_NPM

COPY web /build

WORKDIR /build

RUN npm install
RUN npm run prod

FROM gradle:8.7-jdk11 as BUILD_JAVA

COPY . /build

WORKDIR /build

RUN gradle unpackDist


FROM debian:bullseye-slim

RUN mkdir /work
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y openjdk-11-jdk

WORKDIR /work

COPY --from=BUILD_NPM /build/dist web/dist
COPY --from=BUILD_JAVA /build/build/unpacked/e-manager-0.0.1 dist

ENTRYPOINT ./dist/bin/spk


