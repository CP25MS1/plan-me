FROM nginx:alpine

ARG BASE_PATH
ENV BASE_PATH_STRIPPED=${BASE_PATH#/}

COPY nginx/default.${BASE_PATH_STRIPPED}.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
