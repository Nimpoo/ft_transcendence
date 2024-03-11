FROM node:current-alpine3.19

EXPOSE 3000

WORKDIR /app
COPY . .

RUN npm install

CMD npm run build && npm start
