CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE DATABASE test;

CREATE TABLE users(
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL UNIQUE,
  user_password TEXT NOT NULL,

);




ALTER TABLE users
ADD COLUMN is_loggedIn BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN attempts INTEGER NULL;

ALTER TABLE users
ADD COLUMN first_name TEXT NULL;
ALTER TABLE users
ADD COLUMN last_name TEXT NULL;
ALTER TABLE users
ADD COLUMN aoi INTEGER NULL;
ALTER TABLE users
ADD COLUMN user_role INTEGER NULL;

SELECT * FROM users;

INSERT INTO users (user_name,user_email,user_password) VALUES ('kapil','kapil@email.com','kapil');



CREATE TABLE userdate(
  user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_role INTEGER NOT NULL,
  aoi TEXT NULL,
  user_password TEXT NOT NULL
);

--psql -U postgres
--\c jwtdb
--\dt
--heroku pg:psql

--drdo database

CREATE TABLE users(
  id uuid PRIMARY KEY TEXT DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_role TEXT NOT NULL,
  aoi TEXT NULL,
  password TEXT NOT NULL
);



CREATE TABLE home_settings(
  id serial PRIMARY KEY,
  background_image TEXT NOT NULL,
  image_type TEXT NOT NULL,
  updated_at timestamp NOT NULL
);