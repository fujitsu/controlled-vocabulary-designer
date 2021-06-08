FROM python:3.7-stretch

ARG PROXY
ENV http_proxy ${PROXY}
ENV https_proxy ${PROXY}
ENV HTTP_PROXY ${PROXY}
ENV HTTPS_PROXY ${PROXY}

USER root

# create-user uid
RUN useradd -m user
RUN if [ ! -z "${MS_UID}" -a "${MS_UID}" -ge 1000 ] ;\
         then usermod -u ${MS_UID} user ;\
         else usermod -u 1000 user ; \
    fi

# apt-packages
RUN apt-get -q update && \
    apt-get install -y -q mecab=0.996-3.1 libmecab-dev=0.996-3.1 mecab-ipadic-utf8=2.7.0-20070801+main-1

# python-packages
COPY requirements.txt /tmp/requirements.txt
RUN pip install pip==21.1.1
RUN pip install --default-timeout=1000 --no-cache-dir -r /tmp/requirements.txt

WORKDIR /tmp

# working-dir
RUN mkdir /work

# copy shell(setChmod.sh)
COPY work/shell/setChmod.sh /tmp
RUN chmod 777 /tmp/setChmod.sh

# fasttext
RUN git clone https://github.com/facebookresearch/fastText.git
RUN cd /tmp/fastText/ && pip install . && make && cp /tmp/fastText/fasttext /usr/local/bin

USER user

# NLTK_DATA
RUN python3 -c "import nltk; nltk.download('wordnet'); nltk.download('omw')"

ENTRYPOINT ["sh", "-c", "/tmp/setChmod.sh"]

WORKDIR /work
