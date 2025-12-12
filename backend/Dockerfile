FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy Prisma folder
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy rest of backend code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]



