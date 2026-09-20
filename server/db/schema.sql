-- ChefHive database schema (MySQL 8)
-- Run once:  mysql -u root -p < server/db/schema.sql

CREATE DATABASE IF NOT EXISTS chefhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chefhive;

-- ---------------------------------------------------------------- catalogue

CREATE TABLE IF NOT EXISTS settings (
  name  VARCHAR(50)  NOT NULL PRIMARY KEY,
  value VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cities (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80) NOT NULL UNIQUE,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS occasions (
  id          VARCHAR(40) NOT NULL PRIMARY KEY,
  name        VARCHAR(80) NOT NULL,
  icon        VARCHAR(40) NOT NULL,
  description VARCHAR(255) NOT NULL,
  is_ritual   TINYINT(1)  NOT NULL DEFAULT 0,  -- rituals get the specialist cook by default
  sort_order  INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS festivals (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS food_styles (
  id         VARCHAR(20) NOT NULL PRIMARY KEY,
  name       VARCHAR(80) NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS spice_levels (
  id         VARCHAR(20) NOT NULL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meals (
  id         VARCHAR(20) NOT NULL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  from_time  TIME        NOT NULL,
  to_time    TIME        NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS kitchens (
  id                 VARCHAR(20)  NOT NULL PRIMARY KEY,
  name               VARCHAR(40)  NOT NULL,
  description        VARCHAR(120) NOT NULL,
  comfortable_dishes INT          NOT NULL,
  sort_order         INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cook_levels (
  id              VARCHAR(20)  NOT NULL PRIMARY KEY,
  name            VARCHAR(60)  NOT NULL,
  tagline         VARCHAR(160) NOT NULL,
  base_fee        INT NOT NULL,
  included_guests INT NOT NULL,
  included_dishes INT NOT NULL,
  per_guest       INT NOT NULL,
  per_dish        INT NOT NULL,
  max_guests      INT NOT NULL,
  max_dishes      INT NOT NULL,
  is_popular      TINYINT(1) NOT NULL DEFAULT 0,
  points          JSON NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addons (
  id              VARCHAR(20)  NOT NULL PRIMARY KEY,
  name            VARCHAR(80)  NOT NULL,
  description     VARCHAR(255) NOT NULL,
  price           INT NOT NULL DEFAULT 0,  -- flat or per-unit price
  per_guest_price INT NOT NULL DEFAULT 0,  -- used instead of price when > 0
  unit            VARCHAR(30)  NOT NULL,
  max_qty         INT NOT NULL DEFAULT 1,  -- 1 means it is a simple on/off add-on
  sort_order      INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS traditions (
  id         VARCHAR(40)  NOT NULL PRIMARY KEY,
  name       VARCHAR(80)  NOT NULL,
  region     VARCHAR(80)  NOT NULL,
  signature  VARCHAR(160) NOT NULL,
  blurb      VARCHAR(400) NOT NULL,
  accent     CHAR(7)      NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  id         CHAR(1)     NOT NULL PRIMARY KEY,  -- S starters, M mains, R rice & breads, A sides, D sweets
  name       VARCHAR(60) NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dishes (
  id                VARCHAR(60)  NOT NULL PRIMARY KEY,
  tradition_id      VARCHAR(40)  NOT NULL,
  name              VARCHAR(120) NOT NULL,
  course            CHAR(1)      NOT NULL,
  is_nonveg         TINYINT(1)   NOT NULL DEFAULT 0,
  needs_onion_garlic TINYINT(1)  NOT NULL DEFAULT 0,  -- hidden for satvik and Jain
  has_root_veg      TINYINT(1)   NOT NULL DEFAULT 0,  -- hidden for Jain
  sort_order        INT          NOT NULL DEFAULT 0,
  INDEX idx_dishes_tradition (tradition_id),
  CONSTRAINT fk_dishes_tradition FOREIGN KEY (tradition_id) REFERENCES traditions (id) ON DELETE CASCADE,
  CONSTRAINT fk_dishes_course    FOREIGN KEY (course)       REFERENCES courses (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS packages (
  id           VARCHAR(40)  NOT NULL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  tradition_id VARCHAR(40)  NOT NULL,
  occasion_id  VARCHAR(40)  NOT NULL,
  festival     VARCHAR(80)  NULL,
  food_style   VARCHAR(20)  NOT NULL,
  level_id     VARCHAR(20)  NOT NULL,
  min_guests   INT          NOT NULL,
  image        VARCHAR(120) NOT NULL,
  blurb        VARCHAR(400) NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_pkg_tradition FOREIGN KEY (tradition_id) REFERENCES traditions (id)  ON DELETE CASCADE,
  CONSTRAINT fk_pkg_occasion  FOREIGN KEY (occasion_id)  REFERENCES occasions (id),
  CONSTRAINT fk_pkg_style     FOREIGN KEY (food_style)   REFERENCES food_styles (id),
  CONSTRAINT fk_pkg_level     FOREIGN KEY (level_id)     REFERENCES cook_levels (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS package_dishes (
  package_id VARCHAR(40) NOT NULL,
  dish_id    VARCHAR(60) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (package_id, dish_id),
  CONSTRAINT fk_pkgdish_package FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE CASCADE,
  CONSTRAINT fk_pkgdish_dish    FOREIGN KEY (dish_id)    REFERENCES dishes (id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------- bookings

CREATE TABLE IF NOT EXISTS bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ref           CHAR(9)      NOT NULL UNIQUE,          -- CH-XXXXXX
  occasion_id   VARCHAR(40)  NOT NULL,
  festival      VARCHAR(80)  NULL,
  tradition_id  VARCHAR(40)  NOT NULL,
  food_style    VARCHAR(20)  NOT NULL,
  spice         VARCHAR(20)  NOT NULL,
  package_id    VARCHAR(40)  NULL,
  city          VARCHAR(80)  NOT NULL,
  event_date    DATE         NOT NULL,
  meal          VARCHAR(20)  NOT NULL,
  ready_by      TIME         NOT NULL,
  guests        INT          NOT NULL,
  kitchen       VARCHAR(20)  NOT NULL,
  level_id      VARCHAR(20)  NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  phone         CHAR(10)     NOT NULL,
  email         VARCHAR(160) NULL,
  address       VARCHAR(255) NOT NULL,
  pincode       CHAR(6)      NOT NULL,
  notes         TEXT         NULL,
  cook_fee      INT          NOT NULL,   -- prices are recalculated on the server, never trusted from the browser
  addons_total  INT          NOT NULL,
  total         INT          NOT NULL,
  advance       INT          NOT NULL,
  status        ENUM('new','confirmed','cancelled','completed') NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bookings_date (event_date),
  INDEX idx_bookings_phone (phone),
  INDEX idx_bookings_status (status),
  CONSTRAINT fk_bookings_occasion  FOREIGN KEY (occasion_id)  REFERENCES occasions (id),
  CONSTRAINT fk_bookings_tradition FOREIGN KEY (tradition_id) REFERENCES traditions (id),
  CONSTRAINT fk_bookings_level     FOREIGN KEY (level_id)     REFERENCES cook_levels (id)
) ENGINE=InnoDB;

-- Dish names are copied in, so a booking still reads correctly if a dish is renamed or removed later.
CREATE TABLE IF NOT EXISTS booking_dishes (
  booking_id INT          NOT NULL,
  dish_id    VARCHAR(60)  NOT NULL,
  dish_name  VARCHAR(120) NOT NULL,
  course     CHAR(1)      NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (booking_id, dish_id),
  CONSTRAINT fk_bdish_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_addons (
  booking_id INT         NOT NULL,
  addon_id   VARCHAR(20) NOT NULL,
  addon_name VARCHAR(80) NOT NULL,
  qty        INT         NOT NULL,
  amount     INT         NOT NULL,
  PRIMARY KEY (booking_id, addon_id),
  CONSTRAINT fk_baddon_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------- cooks

CREATE TABLE IF NOT EXISTS cook_applications (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  ref              CHAR(9)      NOT NULL UNIQUE,       -- CK-XXXXXX
  name             VARCHAR(120) NOT NULL,
  phone            CHAR(10)     NOT NULL,
  city             VARCHAR(80)  NOT NULL,
  area             VARCHAR(120) NULL,
  experience       VARCHAR(60)  NOT NULL,
  traditions       JSON         NOT NULL,
  signature_dishes TEXT         NOT NULL,
  occasions        JSON         NULL,
  food_rules       JSON         NULL,
  largest_group    VARCHAR(60)  NULL,
  team             VARCHAR(60)  NULL,
  languages        VARCHAR(160) NULL,
  link             VARCHAR(255) NULL,
  status           ENUM('new','contacted','approved','rejected') NOT NULL DEFAULT 'new',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cooks_status (status),
  INDEX idx_cooks_phone (phone)
) ENGINE=InnoDB;
