FROM node:22.1.0 AS development

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

#PRODUCTION#

FROM node:22.1.0 AS production

ARG NODE_ENV=production
ENV NODE_ENV=$(NODE_ENV)

WORKDIR /src/app

COPY --from=development /src/app/ .

EXPOSE 3000

CMD [ "node", "dist/main" ]