FROM node:latest

EXPOSE 3000

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

ARG NEXT_PUBLIC_REDIRECT_URI
ARG NEXT_PUBLIC_CLIENT_ID
ARG CLIENT_SECRET

RUN npm run build

CMD ["npm", "start"]
