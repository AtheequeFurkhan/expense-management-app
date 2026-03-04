-- Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).

-- WSO2 LLC. licenses this file to you under the Apache License,
-- Version 2.0 (the "License"); you may not use this file except
-- in compliance with the License.
-- You may obtain a copy of the License at

-- http://www.apache.org/licenses/LICENSE-2.0

-- Unless required by applicable law or agreed to in writing,
-- software distributed under the License is distributed on an
-- "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
-- KIND, either express or implied.  See the License for the
-- specific language governing permissions and limitations
-- under the License.


-- Drop existing sample schema if exists
DROP SCHEMA IF EXISTS expense_management;
CREATE SCHEMA expense_management;
USE expense_management;

-- =============================================
-- Reference Data Tables
-- =============================================

-- Departments (synced from PeopleHR)
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_department_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES department(id)
);

-- Expense categories with yearly limits
CREATE TABLE expense_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    gl_code VARCHAR(50),
    yearly_limit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    category_type ENUM('GENERAL', 'OPD', 'TRAVEL', 'MEALS', 'EQUIPMENT', 'OTHER') NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Policy limits per role/level
CREATE TABLE policy_limit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    employee_level VARCHAR(50),
    max_single_claim DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    yearly_limit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    requires_receipt_above DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES expense_category(id)
);

-- =============================================
-- Core Tables
-- =============================================

-- Employee info (cached from HR Entity / PeopleHR)
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    department_id INT,
    designation VARCHAR(255),
    employee_level VARCHAR(50),
    manager_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Expense claims
CREATE TABLE expense_claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    claim_type ENUM('GENERAL', 'OPD', 'TRAVEL', 'MEALS', 'EQUIPMENT', 'OTHER') NOT NULL DEFAULT 'GENERAL',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    receipt_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    status ENUM('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (category_id) REFERENCES expense_category(id)
);

-- Approval workflow
CREATE TABLE claim_approval (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    approver_email VARCHAR(255) NOT NULL,
    approval_level INT NOT NULL DEFAULT 1,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    acted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES expense_claim(id)
);

-- OPD-specific claims
CREATE TABLE opd_claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    relationship ENUM('SELF', 'SPOUSE', 'CHILD', 'PARENT') NOT NULL DEFAULT 'SELF',
    hospital_name VARCHAR(255),
    doctor_name VARCHAR(255),
    diagnosis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES expense_claim(id)
);

-- Credit card expense tracking
CREATE TABLE cc_expense (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    card_last_four VARCHAR(4),
    transaction_ref VARCHAR(100),
    merchant_name VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES expense_claim(id)
);

-- Audit trail
CREATE TABLE claim_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES expense_claim(id)
);

-- =============================================
-- Seed Data
-- =============================================

INSERT INTO department (name, code) VALUES
('Engineering', 'ENG'),
('Human Resources', 'HR'),
('Finance', 'FIN'),
('Operations', 'OPS'),
('Marketing', 'MKT');

INSERT INTO expense_category (name, code, description, gl_code, yearly_limit, category_type) VALUES
('Office Supplies', 'OFF_SUP', 'Stationery, printer ink, etc.', 'GL-1001', 50000.00, 'GENERAL'),
('Travel - Domestic', 'TRV_DOM', 'Domestic travel expenses', 'GL-2001', 200000.00, 'TRAVEL'),
('Travel - International', 'TRV_INT', 'International travel expenses', 'GL-2002', 500000.00, 'TRAVEL'),
('Meals & Entertainment', 'MEALS', 'Client meetings, team meals', 'GL-3001', 100000.00, 'MEALS'),
('OPD Medical', 'OPD_MED', 'Outpatient medical claims', 'GL-4001', 150000.00, 'OPD'),
('Equipment', 'EQUIP', 'Hardware, peripherals', 'GL-5001', 300000.00, 'EQUIPMENT'),
('Software & Subscriptions', 'SW_SUB', 'Software licenses', 'GL-5002', 100000.00, 'GENERAL'),
('Training & Development', 'TRAIN', 'Courses, certifications', 'GL-6001', 200000.00, 'GENERAL'),
('Miscellaneous', 'MISC', 'Other expenses', 'GL-9001', 50000.00, 'OTHER');

INSERT INTO policy_limit (category_id, employee_level, max_single_claim, yearly_limit, requires_receipt_above) VALUES
(1, 'JUNIOR', 5000.00, 25000.00, 1000.00),
(1, 'SENIOR', 10000.00, 50000.00, 2000.00),
(1, 'MANAGER', 20000.00, 100000.00, 5000.00),
(5, 'JUNIOR', 15000.00, 100000.00, 0.00),
(5, 'SENIOR', 20000.00, 150000.00, 0.00),
(5, 'MANAGER', 25000.00, 150000.00, 0.00);