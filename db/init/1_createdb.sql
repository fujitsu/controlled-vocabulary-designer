
CREATE TABLE IF NOT EXISTS editing_vocabulary (
  "id" serial PRIMARY KEY,
  "term" text NOT NULL,
  "preferred_label" text,
  "language" text,
  "uri" text,
  "broader_term" text,
  "other_voc_syn_uri" text,
  "term_description" text,
  "created_time" text,
  "modified_time" text,
  "synonym_candidate" text[],
  "broader_term_candidate" text[],
  "hidden" boolean,
  "position_x" text,
  "position_y" text,
  "color1" text,
  "color2" text,
  "confirm" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS reference_vocabulary_1 (
  "id" serial PRIMARY KEY,
  "term" text NOT NULL,
  "preferred_label" text,
  "language" text,
  "uri" text,
  "broader_term" text,
  "other_voc_syn_uri" text,
  "term_description" text,
  "created_time" text,
  "modified_time" text,
  "position_x" text,
  "position_y" text
);

CREATE TABLE IF NOT EXISTS reference_vocabulary_2 (
  "id" serial PRIMARY KEY,
  "term" text NOT NULL,
  "preferred_label" text,
  "language" text,
  "uri" text,
  "broader_term" text,
  "other_voc_syn_uri" text,
  "term_description" text,
  "created_time" text,
  "modified_time" text,
  "position_x" text,
  "position_y" text
);

CREATE TABLE IF NOT EXISTS reference_vocabulary_3 (
  "id" serial PRIMARY KEY,
  "term" text NOT NULL,
  "preferred_label" text,
  "language" text,
  "uri" text,
  "broader_term" text,
  "other_voc_syn_uri" text,
  "term_description" text,
  "created_time" text,
  "modified_time" text,
  "position_x" text,
  "position_y" text
);

CREATE TABLE IF NOT EXISTS example_phrases (
  "id" serial PRIMARY KEY,
  "phrase" text NOT NULL
);

CREATE TABLE IF NOT EXISTS part_of_speech_filter (
  "noun" boolean NOT NULL,
  "verb" boolean NOT NULL,
  "adjective" boolean NOT NULL,
  "adverb" boolean NOT NULL,
  "adnominal" boolean NOT NULL,
  "interjection" boolean NOT NULL,
  "other" boolean NOT NULL
);

/* insert part_of_speech_filter record. */
INSERT INTO part_of_speech_filter VALUES (TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

/* install plugin pgroonga */
CREATE EXTENSION pgroonga;

/* create example_phrases table INDEX */
CREATE INDEX pgroonga_example_sentences_index
  ON example_phrases
  USING pgroonga (phrase);

/* create example_search_count_func */
CREATE OR REPLACE FUNCTION example_search_count_func("PGroonga" text)
  RETURNS int8 AS $$
  SELECT COUNT(*) FROM example_phrases WHERE phrase &@ "PGroonga";
$$ LANGUAGE SQL IMMUTABLE;

/* create example_search_func */
CREATE OR REPLACE FUNCTION example_search_func("PGroonga" text, index int)
  RETURNS TABLE (id integer, phrase text, score double precision) AS $$
  SELECT *, pgroonga_score(tableoid, ctid) AS score FROM example_phrases WHERE phrase &@ "PGroonga" LIMIT 100 OFFSET index;
$$ LANGUAGE SQL IMMUTABLE;
