FROM iojs:2.2.1-slim
RUN apt-get update && apt-get install -y openssh-client
EXPOSE 3000
ENV PORT 3000
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
CMD [ "iojs", "index.js" ]
