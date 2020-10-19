CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE gender AS ENUM (
    'male',
    'female'
);



CREATE TABLE IF NOT EXISTS marines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    spots_id uuid,
    FOREIGN KEY (spots_id) REFERENCES spots(id) ON UPDATE CASCADE,
    date_created timestamp NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS spots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    price  real,
    length real NOT NULL,
    draught real NOT NULL,
    available boolean DEFAULT TRUE,
    geom geography (point) NOT NULL,
    coords point,
    date_created timestamp NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    price  real,
    description  varchar(1024),
    date_created timestamp NOT NULL DEFAULT NOW()
);


CREATE TABLE users(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    marines_id uuid,
    vessels_id uuid,
    first_name varchar(64),
    last_name varchar(64),
    avatar varchar(256),
    email varchar(64),
    gender gender,
    birthday timestamp,
    user_name varchar(64),
    password varchar(64),
    fb_id varchar(64),
    date_created timestamp NOT NULL DEFAULT NOW(),  
    FOREIGN KEY (marines_id) REFERENCES marines(id) ON UPDATE CASCADE
    FOREIGN KEY (vessels_id) REFERENCES vessels(id) ON UPDATE CASCADE

);

CREATE TABLE IF NOT EXISTS vessels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(64),
    length real NOT NULL,
    draught real NOT NULL,
    description  varchar(1024),
    date_created timestamp NOT NULL DEFAULT NOW()
);

