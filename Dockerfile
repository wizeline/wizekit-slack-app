FROM node:14-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent --ignore-scripts && mv node_modules ../

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
