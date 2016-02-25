DROP TABLE if exists session;
DROP TABLE if exists users;
DROP TABLE if exists cheese CASCADE;
DROP TABLE if exists topping CASCADE;
DROP TABLE if exists bun CASCADE;
DROP TABLE if exists meat CASCADE;
DROP TABLE if exists orders CASCADE;
DROP TABLE if exists order_cheese CASCADE;
DROP TABLE if exists order_topping CASCADE;

CREATE TABLE cheese (
       cheeseid serial PRIMARY KEY UNIQUE,
       type VARCHAR(255)
);

CREATE TABLE topping (
  toppingid serial PRIMARY KEY UNIQUE,
  type VARCHAR(255)
);

CREATE TABLE bun (
  bunid serial PRIMARY KEY UNIQUE,
  type VARCHAR(255)
);

CREATE TABLE meat(
  meatid serial PRIMARY KEY UNIQUE,
  type VARCHAR(255)
);

CREATE TABLE orders(
  orderid serial PRIMARY KEY UNIQUE,
  name VARCHAR(255),
  meatid  integer REFERENCES meat,
  bunid integer REFERENCES bun,
  temperature VARCHAR(255)
);

CREATE TABLE order_cheese (
       orderid integer REFERENCES orders ON DELETE CASCADE,
       cheeseid integer REFERENCES cheese,
       PRIMARY KEY (orderid, cheeseid)
);

CREATE TABLE order_topping (
       orderid integer REFERENCES orders ON DELETE CASCADE,
       toppingid integer REFERENCES topping,
       PRIMARY KEY (orderid, toppingid)
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE TABLE users (
       id SERIAL UNIQUE PRIMARY KEY,
       email VARCHAR(255),
       password_digest TEXT
);
