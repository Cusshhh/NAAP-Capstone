# SYSTEM REQUIREMENTS SPECIFICATION & PROPOSED SYSTEM ARCHITECTURE AND DESIGN

## System Requirements Specification

The System Requirement Specification (SRS) for the Human Resource Department Web-Based Job Portal System of the National Aviation Academy of the Philippines (NAAP) is designed to transform the existing manual recruitment process into a centralized, web-based platform. The system aims to improve the efficiency of handling job applications by providing a digital environment where applicants can submit requirements online and HR personnel can manage recruitment processes in an organized manner.

By integrating job posting, applicant management, and application tracking into a single system, all recruitment-related data is stored and processed digitally. This eliminates the limitations of manual processing, such as data redundancy, delays, and difficulty in tracking applicants. Furthermore, the system provides reporting features and automated qualification match scoring that assist the HR Department in monitoring application progress and improving decision-making.

### Stakeholder Identification and User Roles

The primary stakeholders of the system are the Human Resource (HR) Department of NAAP and the job applicants. The HR Department serves as the main user and decision-maker, responsible for managing job postings, reviewing applications, evaluating applicant qualifications, and monitoring applicant records. To support the recruitment workflow, the system is designed with distinct user roles:

1. **Admin (HR Personnel / HR Staff / Super Admin):** Has administrative control over the system, including creating and editing job vacancies, setting custom file requirements, reviewing applicant Personal Data Sheet (PDS) submissions, viewing automated AI qualification match scores (0–100%), updating application statuses (*Submitted*, *Under Review*, *Shortlisted*, *Interview Scheduled*, *Hired*, *Rejected*), scheduling interviews, communicating with applicants via integrated messaging, monitoring plantilla staffing positions, and exporting summary reports.
2. **Applicants (Job Seekers):** Interact with the system by registering accounts, managing profile details, browsing available non-academic job vacancies, submitting digital application forms, uploading required documents (PDF/DOCX resumes, PDS, certifications), managing *To-Follow* document submissions, and tracking their application status in real time.

This role distribution ensures that both administrative and applicant-side processes are handled efficiently within a single platform.

---

### Functional Requirements

To ensure that the system meets the operational needs of the HR Department and applicants, the functional requirements are defined based on the recruitment process:

1. **User Registration and Authentication Function:** Allows applicants and administrators to securely access the system using login credentials. Features include password encryption (Bcrypt), session management, Role-Based Access Control (RBAC), and optional Two-Factor Authentication (2FA) via TOTP / Google Authenticator for administrative accounts.
2. **Job Posting Management Function:** Enables HR administrators to create, update, publish, close, and archive job vacancies. Admins can specify job titles, departments, employment types, salary grades, job descriptions, responsibilities, deadline dates, and custom document upload requirements.
3. **Application Submission Function:** Allows applicants to apply for open job postings, complete digital Personal Data Sheet (PDS) entries, upload required credentials (resumes, transcripts, Civil Service eligibility forms), and specify pending *To-Follow* documents.
4. **Application Tracking Function:** Enables job applicants to monitor the real-time progress of their submitted applications through a visual status timeline (*Submitted*, *Under Review*, *Shortlisted*, *Interview Scheduled*, *Hired*, *Rejected*).
5. **Applicant Management & Qualification Scoring Function:** Enables HR personnel to view, filter, sort, and evaluate applicant data. The system features an automated **PDS Qualification Match Scoring Engine** that calculates an objective suitability score (0–100%) based on Education Level, Years of Experience, Awards/Eligibility, Training Hours, and Document Completeness to accelerate candidate shortlisting.
6. **Messaging and Interview Scheduling Function:** Supports direct two-way messaging between HR administrators and applicants regarding application updates, document requests, or interview details. Includes an integrated calendar system for scheduling and tracking candidate interview appointments.
7. **Report Generation Function:** Generates downloadable summary reports (CSV/Excel) of recruitment metrics, applicant lists, vacancy distributions, and application status statistics to support data-driven decision-making.
8. **Activity & Audit Logging Function:** Records administrative actions and system events into security audit logs to preserve data transparency and institutional auditability.

---

### Non-Functional Requirements

The system meets non-functional requirements to guarantee high software quality, security, and operational performance based on the ISO/IEC 25010 standard:

1. **Security:** Ensures sensitive user and applicant data are protected through password hashing (Bcrypt), input sanitization, server-side data validation, Role-Based Access Control (RBAC), session encryption, and optional 2FA. Compliance with the Philippines Data Privacy Act of 2012 (RA 10173) safeguards personal credentials and PDS filings.
2. **Usability:** Provides a clean, intuitive, and accessible user interface built using modern UI standards (Tailwind CSS, Radix UI). The interface ensures learnability and visual clarity for both HR personnel and job applicants across desktop, tablet, and mobile viewports.
3. **Performance Efficiency:** Ensures rapid client-side page transitions and quick data retrieval within **< 1.5 seconds**, utilizing Inertia.js single-page application (SPA) routing, Vite asset optimization, and indexed database queries.
4. **Reliability:** Maintains consistent system functionality without errors during high concurrent user activity. Database transactions enforce foreign key constraints and cascading integrity to prevent corrupted or orphaned records.
5. **Maintainability & Scalability:** Designed using a modular Model-View-Controller (MVC) component architecture (Laravel 11 backend and React 19 frontend), allowing future expansion, updates, and feature enhancements with minimal system refactoring.

---

## Proposed System Architecture and Design

The proposed system is designed to support a web-based recruitment process using a structured, three-tier architecture. This design separates the platform into presentation, application, and data layers, ensuring superior system performance, security, and maintainability. Unlike manual paper-based workflows, this architecture handles all recruitment operations digitally and in real time.

```mermaid
graph TD
    subgraph Tier 1: Presentation Layer (Frontend)
        UI["React 19 / Inertia.js Single Page Application"]
        Styles["Tailwind CSS 4 & Radix UI Components"]
        Charts["Recharts Analytics & Responsive Layouts"]
    end

    subgraph Tier 2: Application Programming Interface Layer (Backend Processing)
        Kernel["Laravel 11 Kernel & Controllers"]
        RBAC["Role-Based Access Control (RBAC)"]
        Scoring["PDS Qualification Match Scoring Engine"]
        Auth["Fortify Authentication & 2FA Engine"]
    end

    subgraph Tier 3: Database System (Data Management Layer)
        DB[("MySQL / SQLite Relational Database")]
        Storage["File Storage API (Resumes, PDS, Attachments)"]
    end

    UI <-->|"JSON Props over XHR / HTTP"| Kernel
    Kernel --> RBAC
    Kernel --> Auth
    Kernel --> Scoring
    Kernel <-->|"Eloquent ORM"| DB
    Kernel <-->|"File Storage Manager"| Storage
```

---

### System Architecture Overview

Adopting a web-based client-server architectural model, the system provides a centralized recruitment platform for the Human Resource Department of NAAP at the Villamor Air Base campus. This architecture enforces clear separation between the user interface, application processing logic, and data storage, ensuring the system remains modular, maintainable, and scalable.

#### I. Presentation Layer (Frontend System)
The Presentation Layer serves as the primary interface for both job applicants and HR administrators. Developed using **React 19**, **TypeScript**, **Inertia.js**, and **Tailwind CSS**, it provides a responsive, Single-Page Application (SPA) environment. 
- **For Applicants:** Allows account registration, job searching, digital form completion, document uploading, status timeline tracking, and HR messaging.
- **For HR Administrators:** Provides an administrative control panel for managing job vacancies, evaluating applicant PDS match scores, reviewing candidate documents, scheduling interviews, exporting reports, and tracking plantilla staffing positions.

#### II. Application Programming Interface Layer (Backend Processing)
The Application Programming Interface (API) Layer serves as the core processing engine of the system. Built on **Laravel 11 (PHP 8.2+)**, it processes all server-side logic, routing, middleware checks, and data requests transmitted from the frontend. This layer manages key operations including user authentication, session security, password encryption, input validation, candidate suitability scoring, file handling, and status progression. By separating business logic from the user interface, it guarantees data security, integrity, and smooth interaction between users and the database.

#### III. Data Management Layer (Database System)
The Data Management Layer handles storage, organization, and retrieval of all system data using a **MySQL** relational database engine. It stores user account credentials, job vacancy specifications, applicant records, PDS entries, application statuses, internal messages, interview schedules, staffing positions, and activity logs. The database enforces relational integrity through foreign key constraints, enabling real-time record synchronization for HR administrators and applicants.

---

### System Components and Modules

The system is organized into specialized functional modules designed to eliminate manual recruitment bottlenecks at NAAP:

1. **User Authentication Module:** Handles secure login, account registration, credential verification, session management, password hashing (Bcrypt), and Two-Factor Authentication (2FA) for administrative and applicant accounts.
2. **Job Posting Management Module:** Enables HR administrators to create, update, publish, close, and archive job vacancies. It allows defining specific job descriptions, employment types, salary grades, deadline dates, and custom requirement attachments.
3. **Application Submission Module:** Enables job seekers to apply for active positions online by filling out digital forms, submitting Personal Data Sheet (PDS) parameters, uploading required credentials (PDF/DOCX format), and tagging *To-Follow* documents.
4. **Application Status Tracking Module:** Provides applicants with a visual, real-time tracking timeline displaying current application status (*Submitted*, *Under Review*, *Shortlisted*, *Interview Scheduled*, *Hired*, *Rejected*).
5. **Applicant Management & Qualification Scoring Module:** Equips HR personnel with tools to filter, sort, review, and evaluate candidates. Features an automated **PDS Qualification Match Scoring Engine** that computes applicant suitability scores (0–100%) based on Education, Experience, Awards, and Training Hours.
6. **Admin Dashboard Module:** Serves as the central administrative hub displaying key recruitment metrics, active vacancy summaries, applicant volume charts (via Recharts), and unfilled plantilla staffing counts.
7. **Report Generation Module:** Generates downloadable summary reports in CSV/Excel format covering application progress, candidate pools, and recruitment performance to support institutional reporting.
8. **Database Management Module:** Manages centralized storage, record retrieval, file storage APIs, and security audit logs (`activity_logs`) across all system entities.
