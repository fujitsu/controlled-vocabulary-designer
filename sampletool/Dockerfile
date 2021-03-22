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
    apt-get install -y -q mecab libmecab-dev mecab-ipadic-utf8

# python-packages
COPY requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip
RUN pip install --default-timeout=1000 --no-cache-dir -r /tmp/requirements.txt
RUN wget https://files.pythonhosted.org/packages/c1/d8/bde94b8e012cae4b25274d3633289ca3f79ef580fed46c583a27b0254cdb/MulticoreTSNE-0.0.1.1-py2.py3-none-manylinux1_x86_64.whl
RUN pip install MulticoreTSNE-0.0.1.1-py2.py3-none-manylinux1_x86_64.whl

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
