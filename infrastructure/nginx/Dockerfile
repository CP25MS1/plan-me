FROM nginx:alpine

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

COPY nginx/default.${BASE_PATH}.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
