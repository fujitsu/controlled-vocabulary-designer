FROM python:3.7-stretch

ARG PROXY
ARG HOST_USER_ID
ENV http_proxy ${PROXY}
ENV https_proxy ${PROXY}
ENV HTTP_PROXY ${PROXY}
ENV HTTPS_PROXY ${PROXY}
ENV HOST_USER_ID ${HOST_USER_ID}

USER root

# create-user uid
RUN useradd -u ${HOST_USER_ID} -m user

# apt-packages
RUN apt-get -q update && \
    apt-get install -y -q mecab=0.996-3.1 libmecab-dev=0.996-3.1 mecab-ipadic-utf8=2.7.0-20070801+main-1

# python-packages
COPY requirements.txt /work/requirements.txt
RUN pip install pip==21.1.1
RUN pip install --default-timeout=1000 --no-cache-dir -r /work/requirements.txt

WORKDIR /work

# mountdir
RUN mkdir /mountdir

# copy shell(setChmod.sh)
COPY work/shell/setChmod.sh /work
RUN chmod 777 /work/setChmod.sh

# fasttext
RUN git clone https://github.com/facebookresearch/fastText.git
RUN cd /work/fastText/ && pip install . && make && cp /work/fastText/fasttext /usr/local/bin

USER user

# NLTK_DATA
RUN python3 -c "import nltk; nltk.download('wordnet'); nltk.download('omw')"

ENTRYPOINT ["sh", "-c", "/work/setChmod.sh"]

WORKDIR /mountdir/src
