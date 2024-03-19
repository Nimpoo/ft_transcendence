FROM node:current-alpine3.19

ARG NEXT_PUBLIC_REDIRECT_URI
ARG NEXT_PUBLIC_CLIENT_ID
ARG CLIENT_SECRET

EXPOSE 3000

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]
