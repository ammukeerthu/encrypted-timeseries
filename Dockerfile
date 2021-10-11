FROM node:10

WORKDIR /usr

COPY . .

RUN npm install

EXPOSE 3000
EXPOSE 3001

CMD ["sh","start.sh"]