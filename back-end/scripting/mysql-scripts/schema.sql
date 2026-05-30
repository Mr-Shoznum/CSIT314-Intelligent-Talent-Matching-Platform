-- schema.sql — ITMP Database
-- Usage: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS itmp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE itmp_db;

CREATE TABLE IF NOT EXISTS users (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_type ENUM('candidate','company') NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(30)  DEFAULT NULL,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_account_type (account_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidate_profiles (
    user_id              INT UNSIGNED NOT NULL PRIMARY KEY,
    first_name           VARCHAR(100) NOT NULL DEFAULT '',
    last_name            VARCHAR(100) NOT NULL DEFAULT '',
    headline             VARCHAR(200) DEFAULT NULL,
    bio                  TEXT         DEFAULT NULL,
    location             VARCHAR(200) DEFAULT NULL,
    work_mode_preference VARCHAR(50)  DEFAULT NULL,
    skills               TEXT         DEFAULT NULL,   -- JSON array of strings
    experience           TEXT         DEFAULT NULL,   -- JSON array of objects
    education            TEXT         DEFAULT NULL,   -- JSON array of objects
    resume_path          VARCHAR(500) DEFAULT NULL,
    availability         VARCHAR(100) DEFAULT NULL,
    yoe                  INT UNSIGNED DEFAULT 0,
    open_to_work         TINYINT(1)   DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS company_profiles (
    user_id      INT UNSIGNED NOT NULL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    abn          VARCHAR(20)  DEFAULT NULL,
    description  TEXT         DEFAULT NULL,
    website      VARCHAR(300) DEFAULT NULL,
    industry     VARCHAR(200) DEFAULT NULL,
    location     VARCHAR(200) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employer_id      INT UNSIGNED NOT NULL,
    title            VARCHAR(200) NOT NULL,
    description      TEXT         DEFAULT NULL,
    full_description TEXT         DEFAULT NULL,
    location         VARCHAR(200) DEFAULT NULL,
    work_mode        VARCHAR(50)  DEFAULT NULL,
    salary_min       INT UNSIGNED DEFAULT 0,
    salary_max       INT UNSIGNED DEFAULT 0,
    job_type         VARCHAR(50)  DEFAULT 'Full-time',
    industry         VARCHAR(200) DEFAULT NULL,
    skills           TEXT         DEFAULT NULL,   -- JSON [{name, required}]
    responsibilities TEXT         DEFAULT NULL,   -- JSON array of strings
    requirements     TEXT         DEFAULT NULL,   -- JSON array of strings
    nice_to_have     TEXT         DEFAULT NULL,   -- JSON array of strings
    benefits         TEXT         DEFAULT NULL,   -- JSON array of strings
    status           ENUM('active','closed','draft') DEFAULT 'active',
    expires_date     DATE         DEFAULT NULL,
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_employer (employer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id       INT UNSIGNED NOT NULL,
    candidate_id INT UNSIGNED NOT NULL,
    status       ENUM('pending','reviewed','shortlisted','rejected') DEFAULT 'pending',
    applied_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, candidate_id),
    FOREIGN KEY (job_id)       REFERENCES jobs(id)  ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_jobs (
    user_id  INT UNSIGNED NOT NULL,
    job_id   INT UNSIGNED NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE
) ENGINE=InnoDB;
