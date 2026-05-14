CREATE TABLE users (
    id                    BIGSERIAL PRIMARY KEY,
    username              VARCHAR(50)  NOT NULL UNIQUE,
    email                 VARCHAR(100) NOT NULL UNIQUE,
    password              VARCHAR(255) NOT NULL,
    role                  VARCHAR(20)  NOT NULL DEFAULT 'DEFAULT',
    billing_address       VARCHAR(255),
    failed_login_attempts INT          NOT NULL DEFAULT 0,
    locked_until          TIMESTAMP
);

CREATE TABLE products (
    id        BIGSERIAL PRIMARY KEY,
    name      VARCHAR(100)   NOT NULL,
    price     NUMERIC(10, 2) NOT NULL,
    stock_qty INT            NOT NULL DEFAULT 0,
    image_url VARCHAR(500)
);

CREATE TABLE wheels (
    product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    max_load   INT         NOT NULL,
    material   VARCHAR(50) NOT NULL,
    size       VARCHAR(50) NOT NULL
);

CREATE TABLE bearings (
    product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    diameter   VARCHAR(50) NOT NULL,
    material   VARCHAR(50) NOT NULL,
    size       VARCHAR(50) NOT NULL
);
