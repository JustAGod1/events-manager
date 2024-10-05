FROM nginx:1.25.5-alpine

VOLUME /etc/letsencrypt
COPY ./nginx.conf /etc/nginx/conf.d/server.conf

ARG NGINX_PASS

RUN apk add 	apache2-utils=2.4.62-r0

RUN htpasswd -cb /etc/nginx/conf.d/spk.htpasswd spk ${NGINX_PASS}



