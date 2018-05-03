FROM ubuntu:16.04

MAINTAINER togglecorp info@togglecorp.com

# Clean apt
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/lib/apt/lists/partial/* && \
    rm -rf /var/cache/apt/*

# Update and install common packages with apt
RUN apt-get update -y ;\
    apt-get install -y \
        # Basic Packages
        git \
        locales \
        vim \
        curl \
        unzip \
        # Deep Required Packages
        gawk

# Support utf-8
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

# Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

WORKDIR /code

COPY ./package.json /code/package.json
RUN yarn install

COPY . /code/
