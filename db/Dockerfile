FROM postgres:12.4
RUN localedef -i ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias ja_JP.UTF-8
ENV LANG ja_JP.utf8
COPY ./db/init/ /docker-entrypoint-initdb.d/
