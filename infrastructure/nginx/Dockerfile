# Base image
FROM nginx:alpine

# Accept build-time argument
ARG NGINX_ENV=dev
# Make it available inside the container as an environment variable
ENV NGINX_ENV=${NGINX_ENV}

# Copy environment-specific config file into place
COPY nginx/default.${NGINX_ENV}.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
