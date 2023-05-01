FROM node

WORKDIR /restAPI

COPY . /restAPI

RUN npm install

EXPOSE 3000

CMD ['node', 'app']