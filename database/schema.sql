-- Tạo database
DROP DATABASE IF EXISTS do_an;
CREATE DATABASE do_an;
USE do_an;

-- Bảng 1: dong_co
CREATE TABLE dong_co (
    Ki_hieu VARCHAR(10) PRIMARY KEY,
    So_vong_quay INT NOT NULL,
    Loai_dong_co CHAR(10) NOT NULL,
    Cong_suat FLOAT NOT NULL,
    cos_phi FLOAT NOT NULL,
    TK_TD FLOAT NOT NULL,
    Khoi_Luong FLOAT NOT NULL
);

INSERT INTO dong_co (Ki_hieu, So_vong_quay, Loai_dong_co, Cong_suat, cos_phi, TK_TD, Khoi_Luong)  
VALUES 
    ('DK 42-2', 3000, 'DK', 2.8, 0.88, 1.9, 47),
    ('K112M2', 3000, 'K', 3.0, 0.0, 2.5, 42),
    ('4A90L2Y3', 3000, '4A', 3.0, 0.88, 2.0, 28.7),
    ('DK 52-4', 1500, 'DK', 7.0, 0.85, 1.5, 104),
    ('K160S4', 1500, 'K', 7.5, 0.86, 2.2, 94),
    ('4A132S4Y3', 1500, '4A', 7.5, 0.86, 2.0, 77);

-- Bảng 2: TST
CREATE TABLE TST(
    u_h INT NOT NULL,
    u_1 FLOAT NOT NULL,
    u_2 FLOAT NOT NULL
);

INSERT INTO TST (u_h, u_1, u_2)
VALUES
    (6 , 2.73, 2.2),
    (8 , 3.3, 2.42),
    (10 ,3.83, 2.61),
    (12 , 4.32, 2.78),
    (14 , 4.79, 2.92),
    (16 , 5.23 , 3.06),
    (18 , 5.66 , 3.18),
    (20 , 6.07 , 3.29),
    (22 , 6.48 , 3.39),
    (24 , 6.86 , 3.5),
    (26 , 7.23 , 3.59),
    (28 , 7.6 , 3.68),
    (30 , 7.96, 3.37);

-- Bảng 3: calculation_history
CREATE TABLE calculation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    input_params JSON NOT NULL,
    motor_info JSON NOT NULL,
    calculation_results JSON NOT NULL,
    motor_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE catalog(
    Ki_hieu VARCHAR(10) PRIMARY KEY,
    Cong_suat FLOAT NOT NULL,
    Van_toc FLOAT NOT NULL,
    n FLOAT NOT NULL,
    Cosphi FLOAT NOT NULL,
    TK_TD FLOAT NOT NULL,
    Loai_dong_co VARCHAR(10) NOT NULL,
    Khoi_Luong FLOAT NOT NULL
);

INSERT INTO catalog (Ki_hieu, Cong_suat, Van_toc, n, Cosphi, TK_TD, Loai_dong_co, Khoi_Luong)  
VALUES
    ('K90S2', 0.75, 2845, 77.5, 0.87, 1.9, 'K', 17),
    ('K90 L2', 1.1, 2850, 78.5, 0.87, 2.4, 'K', 20),
    ('K100L2', 1.5, 2860, 79.5, 0/87, 2.5, 'K', 24),
    ('K112M2', 2.2, 2870, 80.5, 0.87, 2.7, 'K', 25),
    ('K132S2', 3.0, 2880, 81.5, 0.87, 3.1, 'K', 30),
    ('K160S2', 4.0, 2890, 82.5, 0.87, 3.6, 'K', 35),
    ('K200L2', 5.5, 2900, 83.5, 0.87, 4.1, 'K', 40),
    ('DK42-2', 2.8, 3000, 81.3 , 0.86 , 4.2 , 'DK' , 27),
    ('DK52-4', 7.0 ,1500 ,80.3 , 0.84 , 3.6 ,'DK' , 30 ),
    ('4A90L2Y3' ,3.0 ,3000 ,70.6 , 0.78, 3.5 ,'4A' , 36 ),
    ('4A132S4Y3' ,7.5 ,1500,80 , 0.88 , 2.6 ,'4A' , 38 ),
    ('K80M2', 0.55, 2830, 76.0, 0.86, 1.8, 'K', 15),  
    ('K90S4', 0.75, 1420, 77.0, 0.85, 2.0, 'K', 18),  
    ('K100L4', 1.1, 1430, 78.0, 0.86, 2.3, 'K', 22),  
    ('K112M4', 1.5, 1440, 79.0, 0.86, 2.6, 'K', 26),  
    ('K132S4', 2.2, 1450, 80.0, 0.86, 3.0, 'K', 32),  
    ('K160M2', 5.0, 2900, 83.0, 0.88, 3.8, 'K', 38),  
    ('K180L2', 7.5, 2910, 84.0, 0.88, 4.3, 'K', 45),  
    ('K200M2', 11.0, 2920, 85.0, 0.89, 4.5, 'K', 50),  
    ('DK32-2', 1.5, 2980, 80.0, 0.85, 4.0, 'DK', 25),  
    ('DK44-4', 3.5, 1480, 81.0, 0.83, 3.5, 'DK', 28),  
    ('DK54-2', 8.0, 3010, 82.0, 0.87, 4.4, 'DK', 32),  
    ('DK62-4', 10.0, 1490, 83.0, 0.85, 3.8, 'DK', 35),  
    ('4A80M2Y3', 1.1, 2980, 69.0, 0.77, 3.2, '4A', 30),  
    ('4A90S4Y3', 1.5, 1480, 70.0, 0.78, 3.3, '4A', 32),  
    ('4A100L2Y3', 4.0, 2990, 71.0, 0.79, 3.6, '4A', 38),  
    ('4A112M4Y3', 5.5, 1490, 72.0, 0.80, 3.7, '4A', 40),  
    ('4A132M2Y3', 9.0, 3000, 81.0, 0.89, 2.8, '4A', 42),  
    ('K220L2', 15.0, 2930, 86.0, 0.90, 4.7, 'K', 55),  
    ('DK72-2', 12.0, 3020, 84.0, 0.88, 4.6, 'DK', 40),  
    ('4A160L4Y3', 11.0, 1500, 82.0, 0.90, 2.9, '4A', 48);