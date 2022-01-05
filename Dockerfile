FROM node:lts-alpine

MAINTAINER togglecorp info@togglecorp.com

RUN apk update\
    && apk add --no-cache git bash python3 g++ make

WORKDIR /code

COPY ./package.json ./yarn.lock /code/
RUN yarn install --frozen-lockfile

COPY . /code/
