FROM node:12.20-alpine

MAINTAINER togglecorp info@togglecorp.com

RUN apk update\
    && apk add --no-cache git bash

WORKDIR /code

COPY ./package.json ./yarn.lock /code/
RUN yarn install --network-concurrency 1

COPY . /code/
