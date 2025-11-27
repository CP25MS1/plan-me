FROM nginx:alpine

ARG ENV
ENV ENV=${ENV}

COPY nginx/default.${ENV}.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
