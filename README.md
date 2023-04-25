# Plantilla NODE.JS ESM
Plantilla de microservicio basada en Node.js con ESM


## Entorno
```
TZ=Europe/Madrid
NODE_ENV=development

LOG_DESTINATION_DIR=.
LOG_DESTINATION_FILENAME=./output-%DATE%.log
LOG_DESTINATION_DATE_PATTERN=YYYY-MM-DD-HH-mm
LOG_DESTINATION_MAX_SIZE=1mb
LOG_DESTINATION_MAX_AGE=3d

EXPRESS_PORT=3000

AXIOS_TEMPLATE_URL=http://host.docker.internal:11006

MONGODB_TEMPLATE_URL=mongodb://user:pass@mdb.hefame.es:27017/database
MONGODB_TEMPLATE_DB=database

MARIADB_TEMPLATE_HOST=server.hefame.es
MARIADB_TEMPLATE_PORT=3306
MARIADB_TEMPLATE_USER=user
MARIADB_TEMPLATE_PASSWORD=secret
MARIADB_TEMPLATE_DB=schemaName

RABBIT_TEMPLATE_URL=amqp://host.docker.internal
```

