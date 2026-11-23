# Herbert Morrison Technical High School â€” School Portal

**Course:** CIT2011 Web Programming
**Institution:** University of Technology, Jamaica
**School:** Herbert Morrison Technical High School, Reading, St. James, Jamaica

---

## Logins

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@herbertmorrison.edu.jm | admin123 |
| Teacher | teacher@herbertmorrison.edu.jm | teacher123 |
| Reviewer | reviewer@herbertmorrison.edu.jm | reviewer123 |

---

## Pages

### index.html â€” Home
Landing page for the portal. Contains a brief school description and links to the About, Contact, and Login pages via nav and cards.

### HTML/Herbert-Morrison-StJames-About.html â€” About Us
Displays the school's history, landmark accomplishments, and a full teacher directory table with departments and subjects.

### HTML/Herbert-Morrison-StJames-Contact.html â€” Contact Us
Shows school contact information (address, phone, email, hours) and a validated contact form. All fields are validated client-side using HTML5 constraints. No data is submitted to a server.

### HTML/Herbert-Morrison-StJames-Login.html â€” Staff Login
Login form for administrators and teachers. Credentials are checked against accounts stored in sessionStorage. On success, admins are redirected to Student Registration, teachers to the Instructor Dashboard, and reviewers to the Reviewer Dashboard.

### HTML/Herbert-Morrison-StJames-StudentRegistration.html â€” Student Registration (Admin only)
Allows the admin to register, edit, and delete students. Student records are saved to localStorage under the key registeredStudents. All other pages (grades, ledger) read from this same key.

### HTML/Herbert-Morrison-StJames-Instructor.html â€” Instructor Dashboard (Teacher only)
The teacher selects a subject from the dropdown and enters assignment, midterm, and final exam scores for each registered student. Grades are auto-calculated and saved to localStorage under grades_subject. Class metrics (average, highest grade, pass rate) update in real time.

### HTML/Herbert-Morrison-StJames-AcademicRecords.html â€” Academic Records
Displays all grades submitted by teachers across every subject. Admins can edit or delete individual grade entries. Reviewers see the same data with read-only access. Data is read directly from the same grades_subject keys the instructor writes to.

### HTML/Herbert-Morrison-StJames-Report.html â€” Financial Ledger
Shows each registered student's tuition, amount paid, balance, and payment status (Paid / Pending / Outstanding). The default tuition per student is J$150,000. Admins can record payments, search and filter the ledger, view a per-student transaction statement, and print. Reviewers have read-only access. Ledger data is stored under localStorage keys ledger and transactions.

### HTML/Herbert-Morrison-StJames-Reviewer.html — Reviewer Dashboard (Reviewer only)
Landing page for the reviewer role. Provides direct links to Academic Records and Financial Ledger with read-only access. Redirects to Login if no session is found.

---

## Storage

| Key | Storage Type | Written by | Read by |
|-----|-------------|------------|---------|
| testLogins | sessionStorage | DB.js | Auth.js |
| CurrentUser | sessionStorage | Auth.js | Ledger.js, Herbert-Morrison-StJames-Login.html |
| registeredStudents | localStorage | Herbert-Morrison-StJames-StudentRegistration.html | Herbert-Morrison-StJames-Instructor.js, Herbert-Morrison-StJames-AcademicRecords.html, Ledger.js |
| grades_subject | localStorage | Herbert-Morrison-StJames-Instructor.js | Herbert-Morrison-StJames-AcademicRecords.html |
| ledger | localStorage | Ledger.js | Ledger.js |
| transactions | localStorage | Ledger.js | Ledger.js |

---

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript - no frameworks or libraries
- localStorage and sessionStorage for all data persistence
- Single master stylesheet: style/Herbert-Morrison-StJames-Main.css
