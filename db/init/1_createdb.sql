
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

CREATE TABLE IF NOT EXISTS editing_vocabulary_meta (
  "id" serial PRIMARY KEY,
  "meta_name" text,
  "meta_enname" text,
  "meta_version" text,
  "meta_prefix" text,
  "meta_uri" text,
  "meta_description" text,
  "meta_endescription" text,
  "meta_author" text
);


