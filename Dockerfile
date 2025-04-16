FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx next build --no-lint
EXPOSE 3000
CMD ["npm", "start"]



