-- =============================================================================
-- VoltReserve Database Schema
-- MySQL 8.0+
-- Run this to set up the database manually (Flask auto-creates tables on start)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS voltreserve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE voltreserve;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id           INT          NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Stations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stations (
    id             INT          NOT NULL AUTO_INCREMENT,
    name           VARCHAR(200) NOT NULL,
    latitude       DOUBLE       NOT NULL,
    longitude      DOUBLE       NOT NULL,
    address        VARCHAR(500),
    is_voltreserve TINYINT(1)   NOT NULL DEFAULT 1,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Ports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ports (
    id              INT        NOT NULL AUTO_INCREMENT,
    port_number     INT        NOT NULL,
    station_id      INT        NOT NULL,
    status          ENUM('AVAILABLE','RESERVED','OCCUPIED') NOT NULL DEFAULT 'AVAILABLE',
    sensor_value    FLOAT,
    last_updated    DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    esp32_updated_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_port_station (port_number, station_id),
    INDEX idx_ports_status (status),
    CONSTRAINT fk_ports_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
    id         INT         NOT NULL AUTO_INCREMENT,
    booking_id VARCHAR(36) NOT NULL,
    user_id    INT         NOT NULL,
    station_id INT         NOT NULL,
    port_id    INT         NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME    NOT NULL,
    status     ENUM('ACTIVE','COMPLETED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    qr_token   VARCHAR(64),
    PRIMARY KEY (id),
    UNIQUE KEY uk_reservations_booking_id (booking_id),
    UNIQUE KEY uk_reservations_qr_token   (qr_token),
    INDEX idx_reservations_user   (user_id),
    INDEX idx_reservations_status (status),
    INDEX idx_reservations_port   (port_id),
    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_reservations_station
        FOREIGN KEY (station_id) REFERENCES stations(id),
    CONSTRAINT fk_reservations_port
        FOREIGN KEY (port_id)    REFERENCES ports(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Notifications (reserved for future use)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id         INT        NOT NULL AUTO_INCREMENT,
    user_id    INT        NOT NULL,
    message    TEXT       NOT NULL,
    type       VARCHAR(50) NOT NULL DEFAULT 'info',
    is_read    TINYINT(1)  NOT NULL DEFAULT 0,
    created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notifications_user (user_id),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Seed data
-- VoltReserve Station — New Delhi (lat: 28.6139, lng: 77.2090)
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO stations (id, name, latitude, longitude, address, is_voltreserve)
VALUES (1, 'VoltReserve Station', 28.6139, 77.2090,
        '1 Rajpath, New Delhi, Delhi 110001', 1);

INSERT IGNORE INTO ports (port_number, station_id, status)
VALUES
    (1, 1, 'AVAILABLE'),
    (2, 1, 'AVAILABLE'),
    (3, 1, 'AVAILABLE');

-- ---------------------------------------------------------------------------
-- Optional: create a default admin user
-- Password hash below is for 'Admin@1234' — change before production!
-- Generate with Python: import bcrypt; bcrypt.hashpw(b'Admin@1234', bcrypt.gensalt())
-- ---------------------------------------------------------------------------
-- INSERT IGNORE INTO users (name, email, password_hash, is_admin)
-- VALUES ('Admin', 'admin@voltreserve.local',
--         '$2b$12$examplehashhere', 1);
