CREATE DATABASE poketodo;

CREATE TABLE pokemon(
    id SERIAL PRIMARY KEY,
    name varchar(80),
    image varchar(255)
);

CREATE TABLE eggs(
    id SERIAL PRIMARY KEY,
    stepsToHatch INT,
    name VARCHAR(80),
    image VARCHAR(255),
    isHatchable BOOLEAN DEFAULT false
);

CREATE TABLE tasks(
    id SERIAL PRIMARY KEY,
    pointAmt INT,
    title VARCHAR(255),
    isCompleted BOOLEAN DEFAULT false
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    points INT,
    name VARCHAR(255)
);