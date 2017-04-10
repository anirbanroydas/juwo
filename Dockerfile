FROM node:7.8-alpine

RUN addgroup -S nodeuser && adduser -S -g nodeuser nodeuser

WORKDIR /project

COPY package.json /project/
COPY npm-shrinkwrap.json /project/
RUN npm install

COPY docker-entrypoint.sh /usr/local/bin/

COPY koatest /project/koatest/
COPY tests /project/tests/


EXPOSE 5001 9091

CMD ["docker-entrypoint.sh"]