# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./ 
RUN npm install

# Copy rest of the app
COPY . .

# Build the production app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy build output to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
