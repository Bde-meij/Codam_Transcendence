FROM node:22.1.0 AS development

WORKDIR /frontend/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli@18.2.0

COPY . .

RUN npm run build

EXPOSE 4200