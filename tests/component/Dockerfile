

COPY tests/component/test_component_identidock.py /component_test/
COPY scripts/wait-for-it.sh /usr/local/bin/

CMD ["wait-for-it.sh", "--host=identidock", "--port=5000", "--timeout=10", "--", "pytest", "-v", "-s", "test_component_identidock.py"]

FROM node:7.8-alpine

WORKDIR /component_test

COPY tests/component/package.json /component_test/
COPY tests/component/npm-shrinkwrap.json /component_test/
RUN npm install

COPY tests/component/test_component_juwo.js /component_test/
COPY scripts/wait-for-it.sh /usr/local/bin/

CMD ["wait-for-it.sh", "--host=juwo", "--port=5001", "--timeout=10", "--", "npm", "test"]