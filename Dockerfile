FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
# Copy package.json and pnpm-lock.yaml (if it exists)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm
# If no lockfile, it will generate one.
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
