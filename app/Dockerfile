FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

# Build the TypeScript code
RUN npm run build

# Expose the desired port
EXPOSE 3000

# Run the application
# CMD ls
CMD ["npm", "run", "dev"]