CREATE TABLE carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id         BIGSERIAL      PRIMARY KEY,
    cart_id    BIGINT         NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products(id),
    quantity   INT            NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id               BIGSERIAL      PRIMARY KEY,
    user_id          BIGINT         NOT NULL REFERENCES users(id),
    total_price      NUMERIC(10, 2) NOT NULL,
    status           VARCHAR(20)    NOT NULL DEFAULT 'REGISTERED',
    payment_method   VARCHAR(20)    NOT NULL DEFAULT 'CARD',
    delivery_address VARCHAR(500),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id         BIGSERIAL      PRIMARY KEY,
    order_id   BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT         NOT NULL REFERENCES products(id),
    quantity   INT            NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);
