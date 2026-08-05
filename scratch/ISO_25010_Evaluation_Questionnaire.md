# ISO/IEC 25010 Software Quality Evaluation Questionnaire
**Project Title**: Human Resource Department Web-Based Job Portal System for National Aviation Academy of the Philippines (NAAP)  
**Target System**: NAAP AI-Powered HR & Job Portal Web Application  
**Standard**: ISO/IEC 25010 System and Software Quality Model  

---

## 📌 Executive Summary of Validator Corrections

The previous questionnaire was flagged by your validators due to major methodology issues:

| Issue in Previous Draft | Validator Rejection Reason | Corrected Standard Implementation |
| :--- | :--- | :--- |
| **Scale Description Errors** | Scales 3, 2, and 1 duplicated negative descriptions ("struggles", "fails completely"). | **Corrected 5-Point Scale Definitions** with distinct, progressive academic descriptors for each level (5 to 1). |
| **Non-Standard Trait Names** | Renamed "Usability" to "Interaction Capability" and replaced "Portability" with custom traits. | **Official 8 ISO/IEC 25010 Characteristics**: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, Portability. |
| **Unseparated Respondent Roles** | End-users (Applicants/HR) were asked technical questions like SQL injection and code modularity. | **Two-Tiered Instrument**: <br>1. **IT Experts / Systems Evaluators** (Technical 8 Characteristics) <br>2. **End-Users / HR Staff & Applicants** (User-Centric Quality in Use). |

---

# 📄 INSTRUMENT 1: IT EXPERT / TECHNICAL EVALUATOR QUESTIONNAIRE
*(For IT Professionals, Systems Auditors, Software Engineers, and Capstone Panel Members)*

### **Part I: Evaluator Profile**
- **Name (Optional)**: _____________________________________________
- **Primary IT Role**: `[ ]` Software Developer `[ ]` Database Administrator `[ ]` Systems Analyst `[ ]` IT Academician `[ ]` Cybersecurity Specialist
- **Years of IT Experience**: `[ ]` 1-3 years `[ ]` 4-7 years `[ ]` 8+ years

---

### **Part II: ISO/IEC 25010 Technical Quality Evaluation (Quantitative Data)**

**Directions**: Please evaluate how well the system exhibits each quality characteristic based on ISO/IEC 25010 by ticking the appropriate box using the 5-point Likert scale below.

#### **5-Point Likert Rating Scale & Verbal Interpretation Table**:

| Scale | Verbal Interpretation | Weighted Mean Range | Description |
|:---:|:---|:---:|:---|
| **5** | **Strongly Agree (SA)** | **4.20 – 5.00** | The system consistently and flawlessly exhibits this quality characteristic. All features exceed expectations and perform with high technical quality. |
| **4** | **Agree (A)** | **3.40 – 4.19** | The system exhibits this quality characteristic well and functions properly. Features operate satisfactorily with minor or negligible issues. |
| **3** | **Neutral (N)** | **2.60 – 3.39** | The system exhibits this quality characteristic to a moderate degree. Features function adequately but may occasionally require minor adjustments or clarification. |
| **2** | **Disagree (D)** | **1.80 – 2.59** | The system struggles to exhibit this quality characteristic. Features function poorly, exhibit noticeable flaws, or require significant improvement. |
| **1** | **Strongly Disagree (SD)** | **1.00 – 1.79** | The system fails to exhibit this quality characteristic. Features are unusable, severely broken, or missing entirely. |

---

#### **1. Functional Suitability**
*(Degree to which the software provides functions that meet stated and implied needs.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 1.1 | **Functional Completeness**: The system covers all required recruitment workflows (vacancy publishing, online application, document parsing, applicant tracking, and analytics). | | | | | |
| 1.2 | **Functional Correctness**: The automated qualification scoring engine accurately calculates applicant suitability based on job specifications. | | | | | |
| 1.3 | **Functional Appropriateness**: The administrative dashboard and applicant tracking modules provide relevant tools that facilitate effective hiring decisions. | | | | | |

---

#### **2. Performance Efficiency**
*(Performance relative to the amount of resources used under stated conditions.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 2.1 | **Time Behaviour**: The system exhibits fast response times during page navigation, job search queries, and applicant filtering. | | | | | |
| 2.2 | **Resource Utilization**: Server and client-side memory/CPU consumption remain low during multi-file document uploads and analytics rendering. | | | | | |
| 2.3 | **Capacity**: The system maintains stable execution and throughput when handling multiple concurrent user sessions and large database transactions. | | | | | |

---

#### **3. Compatibility**
*(Degree to which the system can exchange information with other systems and share common hardware/software environments.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 3.1 | **Co-existence**: The web application operates seamlessly alongside other web services, client operating systems, and background processes without conflict. | | | | | |
| 3.2 | **Interoperability**: The system successfully exports recruitment reports to standard file formats (PDF, CSV) and supports integration with communication protocols (Email/SMS). | | | | | |

---

#### **4. Usability**
*(Degree to which the software can be used by specified users to achieve specified goals effectively, efficiently, and with satisfaction.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 4.1 | **Appropriateness Recognizability**: Users can easily recognize whether the application functions match their operational needs. | | | | | |
| 4.2 | **Learnability**: The intuitive layout enables new HR staff and applicants to navigate features with minimal training. | | | | | |
| 4.3 | **Operability**: The interface provides clear controls, responsive navigation, and straightforward form entry routines. | | | | | |
| 4.4 | **User Error Protection**: Form validation mechanisms prevent invalid inputs, incomplete submissions, and accidental data entry errors. | | | | | |
| 4.5 | **User Interface Aesthetics**: The UI design adheres to modern aesthetics, consistent typography, and harmonious visual hierarchy. | | | | | |

---

#### **5. Reliability**
*(Degree to which the system performs specified functions under specified conditions for a specified period.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 5.1 | **Maturity**: The system operates reliably without frequent runtime errors, unhandled exceptions, or system crashes. | | | | | |
| 5.2 | **Availability**: The web application remains operational and accessible during peak application periods. | | | | | |
| 5.3 | **Fault Tolerance**: The system gracefully handles missing data, network drops, or improper input without corrupting database state. | | | | | |
| 5.4 | **Recoverability**: In the event of a session interruption, the system preserves user state and restores data correctly upon re-authentication. | | | | | |

---

#### **6. Security**
*(Degree to which the system protects information and data so that unauthorized persons cannot read or modify them.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 6.1 | **Confidentiality**: The system enforces password hashing (Bcrypt/Argon) and secure session management to protect user accounts. | | | | | |
| 6.2 | **Integrity**: The application protects database records against unauthorized modification, cross-site scripting (XSS), and SQL injection vulnerabilities. | | | | | |
| 6.3 | **Accountability**: The administrative audit log records operations (e.g., job creation, status updates, deletions) to establish administrative traceability. | | | | | |
| 6.4 | **Authenticity**: Role-Based Access Control (RBAC) strictly restricts privileges between HR Admins and Applicants in compliance with RA 10173 (Data Privacy Act). | | | | | |

---

#### **7. Maintainability**
*(Degree of effectiveness and efficiency with which the software can be modified by developers.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 7.1 | **Modularity**: The codebase is structured cleanly into decoupled components (Inertia/React frontend, Laravel Eloquent controllers, routing table). | | | | | |
| 7.2 | **Reusability**: Core UI components (buttons, modals, tables, icons) are modular and reusable across different administrative views. | | | | | |
| 7.3 | **Analysability**: Comprehensive error logging and debug output allow developers to easily trace and diagnose operational issues. | | | | | |
| 7.4 | **Modifiability**: Database schemas and controller logic can be updated or extended without breaking existing system functionalities. | | | | | |

---

#### **8. Portability**
*(Degree of effectiveness and efficiency with which a system can be transferred from one hardware, software, or operational environment to another.)*

| No. | Indicator / Parameter | 5 | 4 | 3 | 2 | 1 |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 8.1 | **Adaptability**: The web portal renders responsively across desktop, laptop, tablet, and mobile screen viewports. | | | | | |
| 8.2 | **Installability**: The application deployment process (environment configuration, migrations, build scripts) can be executed straightforwardly on standard web hosting servers. | | | | | |
| 8.3 | **Replaceability**: The system can seamlessly replace legacy paper-based HR workflows and manual document submission routines. | | | | | |

---

### **Part III: Qualitative Insights & Technical Recommendations (Qualitative Data)**

#### **1. Technical Architecture & Future Feature Applicability**
*Direction: Please check the box next to any architectural or technical features you agree would be highly beneficial for the next phase of system deployment.*

- `[ ]` **Direct Email & SMS Gateway Integration**: Automated SMS notifications via Semaphore/Twilio API for interview invitations and application status alerts.
- `[ ]` **OCR & Scanned PDF Parsing**: OCR capabilities (Tesseract/Google Vision API) for automatic text extraction from image-based scanned credentials.
- `[ ]` **PWA / Mobile Application Native Build**: Progressive Web App (PWA) manifest or React Native build for mobile recruitment tracking.
- `[ ]` **Integrated Calendar & Video Interview Linker**: Automated Google Calendar / Zoom link generator for scheduled applicant interviews.
- `[ ]` **Predictive AI HR Analytics**: Predictive analytics model for forecasting recruitment demand and applicant volume across NAAP academic and technical departments.
- `[ ]` **Other Technical Recommendation (Please specify)**: __________________________________________________________________

#### **2. Technical Evaluation Questions**:
1. **Which technical component or architectural feature of the system is the most robust and well-executed?**  
   ________________________________________________________________________________________________________________________  

2. **What technical enhancements or architectural improvements would you recommend for future scaling and deployment?**  
   ________________________________________________________________________________________________________________________  

3. **Did you identify any technical defects, security concerns, or performance bottlenecks during testing? (If yes, please detail):**  
   ________________________________________________________________________________________________________________________  

---

# 📄 INSTRUMENT 2: END-USER EVALUATION QUESTIONNAIRE
*(For HR Administrators, HR Personnel, and Job Applicants)*

### **Part I: Respondent Profile**
- **User Role**: `[ ]` NAAP HR Administrator / Staff `[ ]` NAAP Faculty / Department Head `[ ]` Job Applicant
- **Frequency of Web Application Use**: `[ ]` Daily `[ ]` Weekly `[ ]` First-time user

---

### **Part II: User Quality Evaluation (Likert 5-Point Scale)**

| No. | Parameter / Evaluation Statement | 5 (SA) | 4 (A) | 3 (N) | 2 (D) | 1 (SD) |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **1** | **Ease of Use**: The portal is easy to navigate, and I can quickly find job postings or application tracking tools. | | | | | |
| **2** | **Application Process**: Uploading credentials and submitting job applications is straightforward and hassle-free. | | | | | |
| **3** | **Visual Appeal**: The visual design, colors, fonts, and layout look professional, clean, and pleasant to use. | | | | | |
| **4** | **Speed & Response**: The pages load quickly and actions (button clicks, form saves) respond immediately without lag. | | | | | |
| **5** | **Status Transparency**: Real-time status updates (*Submitted, Shortlisted, Interview*) give me clear visibility over application progress. | | | | | |
| **6** | **Error Guidance**: The system provides clear error messages if I forget required fields or upload incorrect files. | | | | | |
| **7** | **Data Trust & Privacy**: I feel confident that my personal information and documents are stored securely and privately. | | | | | |
| **8** | **Overall Satisfaction**: Overall, the NAAP HR Web-Based Job Portal significantly improves the recruitment and application experience. | | | | | |

---

### **Part III: Qualitative Feedback & User Suggestions**
1. **What features of the system did you find most helpful in your daily tasks?**  
   __________________________________________________________________________________________  
2. **What changes or improvements would you suggest we add to make the system better?**  
   __________________________________________________________________________________________  
3. **Did you experience any errors or difficulties while using the system? (If yes, please explain):**  
   __________________________________________________________________________________________  

---

**Thank you for your valuable time and participation!**  
*NAAP BSIT Aviation Information Technology Capstone Research Team*
