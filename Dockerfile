FROM node:15.5.1-alpine3.10
# how optimize docker file? layers https://habr.com/ru/company/ruvds/blog/485650/ reduce size
ENV PORT=3000

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --frozen-lockfile --production

COPY ./src ./src
ENTRYPOINT [ "node", "src/index.js" ]
