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
ENV LOG_DESTINATION_DATE_PATTERN=YYYY-MM-DD
ENV LOG_DESTINATION_MAX_SIZE=1mb
ENV LOG_DESTINATION_MAX_AGE=3d

ENV EXPRESS_PORT=3000

ENV SNOWFLAKE_ACCOUNT=account
ENV SNOWFLAKE_USER=user
ENV SNOWFLAKE_PASS=pass

EXPOSE ${EXPRESS_PORT}

CMD [ "node", "src/index.mjs" ]