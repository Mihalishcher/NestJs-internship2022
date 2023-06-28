FROM node:18-alpine3.16

WORKDIR /internship

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

CMD [ "node", "dist/main.js" ]