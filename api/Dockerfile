FROM python:3.6-stretch

ARG PROXY

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./api/requirements.txt /usr/src/app/

ENV http_proxy ${PROXY}
ENV https_proxy ${PROXY}
ENV HTTP_PROXY ${PROXY}
ENV HTTPS_PROXY ${PROXY}

RUN pip3 install --upgrade pip
RUN pip3 install --no-cache-dir -r requirements.txt

COPY ./api /usr/src/app

EXPOSE 5000

ENTRYPOINT ["python3"]

CMD ["-m", "swagger_server"]
