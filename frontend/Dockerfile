FROM node:21.7.1 AS development

WORKDIR /frontend/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN npm run build

EXPOSE 4200