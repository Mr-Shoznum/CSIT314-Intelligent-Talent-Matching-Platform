-- schema.sql
-- Run this once to set up the ITMP database.
-- Usage: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS itmp_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE itmp_db;

-- ── Shared users table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    account_type  ENUM('candidate','company') NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,          -- bcrypt via password_hash()
    phone         VARCHAR(30)     DEFAULT NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email (email),
    INDEX idx_account_type (account_type)
) ENGINE=InnoDB;

-- ── Candidate profile ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profiles (
    user_id       INT UNSIGNED    NOT NULL,
    first_name    VARCHAR(100)    NOT NULL,
    last_name     VARCHAR(100)    NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Company profile ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_profiles (
    user_id       INT UNSIGNED    NOT NULL,
    company_name  VARCHAR(200)    NOT NULL,
    abn           VARCHAR(20)     DEFAULT NULL,   -- Australian Business Number
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
