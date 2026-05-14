-- password: Admin1234! (bcrypt cost 12)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@palletwheels.com',
        '$2a$12$yMqUzCKsBrk2jVLRLc4the58AKDnddCujLD55tcfs.WT5k0QfzzCG',
        'ADMIN');

-- password: User1234! (bcrypt cost 12)
INSERT INTO users (username, email, password, role)
VALUES ('testuser', 'user@palletwheels.com',
        '$2a$12$YRFKRIMTWnVSHl2TTpUj8edsMXoT7pKofMlND13nbJ1dtKMi7ihQ.',
        'DEFAULT');

-- Wheels
INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Polyurethane Wheel 200mm', 45.99, 120, NULL);
INSERT INTO wheels (product_id, max_load, material, size)
VALUES (currval('products_id_seq'), 600, 'Polyurethane', '200mm');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Nylon Wheel 150mm', 28.50, 85, NULL);
INSERT INTO wheels (product_id, max_load, material, size)
VALUES (currval('products_id_seq'), 300, 'Nylon', '150mm');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Rubber Wheel 250mm Heavy Duty', 72.00, 50, NULL);
INSERT INTO wheels (product_id, max_load, material, size)
VALUES (currval('products_id_seq'), 1000, 'Rubber', '250mm');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Cast Iron Wheel 180mm', 95.00, 30, NULL);
INSERT INTO wheels (product_id, max_load, material, size)
VALUES (currval('products_id_seq'), 1500, 'Cast Iron', '180mm');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Polyurethane Wheel 125mm', 22.00, 200, NULL);
INSERT INTO wheels (product_id, max_load, material, size)
VALUES (currval('products_id_seq'), 200, 'Polyurethane', '125mm');

-- Bearings
INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Ball Bearing 6205', 8.99, 500, NULL);
INSERT INTO bearings (product_id, diameter, material, size)
VALUES (currval('products_id_seq'), '52mm', 'Steel', '25x52x15');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Roller Bearing 6308', 15.50, 300, NULL);
INSERT INTO bearings (product_id, diameter, material, size)
VALUES (currval('products_id_seq'), '90mm', 'Steel', '40x90x23');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Stainless Bearing 6004', 12.00, 150, NULL);
INSERT INTO bearings (product_id, diameter, material, size)
VALUES (currval('products_id_seq'), '42mm', 'Stainless Steel', '20x42x12');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Deep Groove Bearing 6206', 9.75, 400, NULL);
INSERT INTO bearings (product_id, diameter, material, size)
VALUES (currval('products_id_seq'), '62mm', 'Chrome Steel', '30x62x16');

INSERT INTO products (name, price, stock_qty, image_url)
VALUES ('Ceramic Bearing 6001', 35.00, 80, NULL);
INSERT INTO bearings (product_id, diameter, material, size)
VALUES (currval('products_id_seq'), '28mm', 'Ceramic', '12x28x8');
