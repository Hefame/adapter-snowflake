FROM node:18-alpine

# Install app dependencies
WORKDIR /usr/local/app


COPY package.json ./
COPY yarn.lock ./
RUN yarn install


# Bundle app source

COPY . .

ENV TZ=Europe/Madrid
ENV NODE_ENV=development

ENV LOG_DESTINATION_DIR=.
ENV LOG_DESTINATION_FILENAME=./output-%DATE%.log
ENV LOG_DESTINATION_DATE_PATTERN=YYYY-MM-DD-HH-mm
ENV LOG_DESTINATION_MAX_SIZE=1mb
ENV LOG_DESTINATION_MAX_AGE=3d

ENV EXPRESS_PORT=3000

ENV AXIOS_TEMPLATE_URL=http://host.docker.internal:11006

ENV MONGODB_TEMPLATE_URL=mongodb://user:pass@mdb.hefame.es:27017/database
ENV MONGODB_TEMPLATE_DB=database

ENV MARIADB_TEMPLATE_HOST=server.hefame.es
ENV MARIADB_TEMPLATE_PORT=3306
ENV MARIADB_TEMPLATE_USER=user
ENV MARIADB_TEMPLATE_PASSWORD=secret
ENV MARIADB_TEMPLATE_DB=schemaName

ENV RABBIT_TEMPLATE_URL=amqp://host.docker.internal

EXPOSE ${EXPRESS_PORT}

CMD [ "node", "src/index.mjs" ]