FROM node
WORKDIR /usr/app
COPY package.json .
RUN npm install && npm install --global mocha
COPY . .