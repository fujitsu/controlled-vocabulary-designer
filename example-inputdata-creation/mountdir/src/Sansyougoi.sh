#!/bin/sh

TEST_OK=OK

echo Sahsyougoi.sh start.
echo

PHASE="ExternalVocabulary"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i -o ExternalVocabulary.json || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="WordEmbedding2"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ExternalVocabulary.json -o WordEmbedding2.npy WordEmbedding2.model || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="Sansyougoi"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ExternalVocabulary.json WordEmbedding2.npy ../data/domain_words.csv -o ../data/SansyougoiAll.csv ../data/SansyougoiTarget.csv || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

echo Sahsyougoi.sh successfully finished.
exit 0

