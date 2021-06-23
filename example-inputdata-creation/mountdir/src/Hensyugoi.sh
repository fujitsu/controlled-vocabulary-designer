#!/bin/sh

TEST_OK=OK

echo Hensyugoi.sh start.
echo

PHASE="WordSeparation"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ../data/wiki.txt -o ../data/wiki_wakati_preprocessed.txt WordSeparation.npy || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="WordEmbedding"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ../data/wiki_wakati_preprocessed.txt ../data/tag.csv ../data/domain_wakati_preprocessed.txt -o WordEmbedding.npy WordEmbedding.model || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="SynonymExtraction"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ../data/tag.csv ../data/domain_wakati_preprocessed.txt WordEmbedding.model -o SynonymExtraction.npy || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="HypernymExtraction"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ../data/wiki_wakati_preprocessed.txt ../data/tag.csv -o HypernymExtraction.npy || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="Filtering"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i ../data/tag.csv ../data/domain_wakati_preprocessed.txt WordEmbedding.npy -o Filtering.npy || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

PHASE="Hensyugoi"
echo ${PHASE}
python3 ./${PHASE}.py -c config.json -i WordSeparation.npy WordEmbedding.npy SynonymExtraction.npy HypernymExtraction.npy Filtering.npy -o ../data/Hensyugoi.csv || TEST_OK=NG
if [ "${TEST_OK}" != "OK" ]; then
    echo "${PHASE} Failed"
    exit 1
fi

echo Hensyugoi.sh successfully finished.
exit 0
