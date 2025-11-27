FROM nginx:alpine

ARG BASE_PATH=prod
ENV BASE_PATH_STRIPPED=${BASE_PATH#/}

RUN set -eux; \
    conf_name="${BASE_PATH_STRIPPED:-prod}"; \
    cp "nginx/default.${conf_name}.conf" /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
