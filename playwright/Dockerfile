FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

CMD ["npx", "playwright", "test"]