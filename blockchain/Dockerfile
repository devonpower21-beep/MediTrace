FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files first for better caching
COPY package.json ./
RUN npm install

# Copy rest of the project
COPY . .

# Expose RPC port
EXPOSE 8545

# Start Hardhat node with auto-deployment
CMD ["sh", "-c", "npx hardhat node --hostname 0.0.0.0 &  sleep 5 && npx hardhat run --network localhost scripts/deploy.js && tail -f /dev/null"]
