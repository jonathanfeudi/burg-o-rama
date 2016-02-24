DROP TABLE if exists session;
DROP TABLE if exists users;
DROP TABLE if exists cheeses CASCADE;
DROP TABLE if exists toppings CASCADE;
DROP TABLE if exists buns CASCADE;
DROP TABLE if exists meats CASCADE;
DROP TABLE if exists orders CASCADE;
DROP TABLE if exists cheeses_orders_join CASCADE;
DROP TABLE if exists toppings_orders_join CASCADE;

CREATE TABLE cheeses (
       cheese_id serial PRIMARY KEY UNIQUE,
       name VARCHAR(255),
       country VARCHAR(255)
);

CREATE TABLE toppings (
  topping_id serial PRIMARY KEY UNIQUE,
  name VARCHAR(255),
  type VARCHAR(255)
);

CREATE TABLE buns (
  bun_id serial PRIMARY KEY UNIQUE,
  name VARCHAR(255),
  gluten_free BOOLEAN
);

CREATE TABLE meats(
  meat_id serial PRIMARY KEY UNIQUE,
  name VARCHAR(255),
  type VARCHAR(255)
);

CREATE TABLE orders(
  order_id serial PRIMARY KEY UNIQUE,
  meat_id  integer REFERENCES meats,
  bun_id integer REFERENCES buns,
  doneness VARCHAR(255)
);

CREATE TABLE cheeses_orders_join (
       order_id integer REFERENCES orders,
       cheese_id integer REFERENCES cheeses,
       PRIMARY KEY (order_id, cheese_id)
);

CREATE TABLE toppings_orders_join (
       order_id integer REFERENCES orders,
       topping_id integer REFERENCES toppings,
       PRIMARY KEY (order_id, topping_id)
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
