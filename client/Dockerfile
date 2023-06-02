FROM node:12
RUN echo "deb http://deb.debian.org/debian jessie main\ndeb http://security.debian.org jessie/updates main" > /etc/apt/sources.list

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Cache node_modules
COPY package.json yarn.lock /app/
RUN cd /app && yarn install
COPY . /app

WORKDIR /app
