FROM node:lts-alpine3.13 as build
WORKDIR /app
COPY package.json ./package.json
RUN npm
COPY . .
RUN npm docs

EXPOSE 3000
CMD ["npm", "pm2"]
