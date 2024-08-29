FROM node:20.9.0 AS development

WORKDIR /frontend/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli@17.3.8

COPY . .

RUN npm run build

EXPOSE 4200
