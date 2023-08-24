FROM node:18.17-alpine

LABEL maintainer="Deep Dev dev@thedeep.com"

RUN apk update\
    && apk add --no-cache git bash python3 g++ make

WORKDIR /code

COPY ./package.json ./yarn.lock /code/
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . /code/
