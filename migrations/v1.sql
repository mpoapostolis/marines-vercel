CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE gender AS ENUM (
    'male',
    'female'
);


CREATE TABLE IF NOT EXISTS marines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    price  real,
    marine_id uuid NOt NULL,
    length real NOT NULL,
    draught real NOT NULL,
    available boolean DEFAULT TRUE,
    geom geography (point),
    coords point,
    date_created timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (marine_id) REFERENCES marines(id) ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    marine_id uuid,
    name varchar(64),
    price  real,
    description  varchar(1024),
    date_created timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (marine_id) REFERENCES marines(id) ON UPDATE CASCADE
);


CREATE TABLE users(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    first_name varchar(64),
    last_name varchar(64),
    avatar varchar(256),
    email varchar(64),
    gender gender,
    birthday timestamp,
    user_name varchar(64),
    password varchar(64),
    fb_id varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW()  
);

CREATE TABLE IF NOT EXISTS vessels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    name varchar(64),
    length real NOT NULL,
    draught real NOT NULL,
    description  varchar(1024),
    date_created timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
);

