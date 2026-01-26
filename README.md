***

# Leave Management System (JEE + React)

Enterprise leave management system built with Jakarta EE on WildFly and a React frontend.

Sprint 1 delivers:

- Secure authentication against OpenLDAP (hosted on polytech.ddns.net)
- User data and roles stored in MySQL
- Secured REST endpoint /api/auth/me
- React login and basic role-based dashboard (EMPLOYEE / MANAGER / HR)

***

Sprint 2 delivers:

- Leave domain model (types, balances, requests) persisted in MySQL
- Employee leave request creation with balance validation and manager routing
- REST endpoints for listing and filtering a user’s leave requests
- Employee dashboard calendar view with leave status and type colors
- Frontend toasts for clear API error and success feedback

***

Sprint 3 delivers:

- Manager request review UI:
  - Team page shows all direct reports and a member detail dialog with that employee’s leave requests.
  - Manager dashboard with yearly calendar and latest team requests table (with pagination).

- Approval workflow (manager + HR):
  - Approve / reject actions on pending requests from manager and HR dashboards.
  - Optional comments on approve/reject via confirmation dialog.
  - Requests can be cancelled by the employee while still pending.

- Backend workflow logic:
  - `approveRequest` / `rejectRequest` service methods:
    - Re-validate leave balance at approval time.
    - Update `leave_requests` status, timestamps, current approver, and approval level.
    - Adjust `leave_balances.taken_days` and derived remaining days on approval.
  - `cancelRequest` service:
    - Allows employees to cancel their own pending requests.
    - Sets status to CANCELLED and clears current approver.

- Audit / history:
  - `approval_history` JPA entity and repository mapped to the MySQL `approval_history` table.
  - History entries created for APPROVED, REJECTED, and CANCELLED actions with:
    - Request, approver, action, level, optional comment, and timestamp.

- Dashboards:
  - Employee dashboard:
    - Annual and sick leave cards showing entitled, taken, and remaining days from `leave_balances`.
    - Card for the next approved leave.
    - Year calendar view of the employee’s requests.
    - My Leave Requests page with filters and in-row cancel action for pending requests.
  - Manager dashboard:
    - Same personal leave cards as employee.
    - Extra card for “Team on leave today” (number of direct reports currently on approved leave).
    - Year calendar for the manager’s own leave.
    - Latest team requests table (all statuses) with role-based approve/reject in the modal.
  - HR dashboard:
    - Workforce overview cards:
      - Total EMPLOYEEs.
      - Total MANAGERs.
      - Total users (employees + managers + HR).
    - Global calendar of all employees’ leave.
    - Latest leave requests table for all employees with role column (EMPLOYEE / MANAGER / HR) and status badges.

***

Sprint 4 delivers:

- Leave types administration:
  - LeaveType JPA entity and repository aligned with the leave_types table.
  - Secured REST API under /api/leave-types for listing, creating, updating, and enabling/disabling leave types.
  - HR Leave Policies screen in React to manage codes, names, quotas (max days/year), paid/unpaid, approval requirement, colors, and active status.

- Quotas and rules:
  - LeaveBalance entity and repository aligned with the leave_balances table.
  - LeaveBalanceService to generate yearly balances for all active users and active leave types based on max_days_per_year.
  - MySQL AFTER INSERT trigger on users to create initial ANNUAL and SICK balances for new users.
  - MySQL event scheduler to automatically create missing leave_balances rows each new year so policy changes are applied to future entitlements.

- User administration:
  - User, Role, and Department entities with supporting DTOs for admin use (UserDTO, UserAdminDTO, UserAdminRequest, UserTeamDTO).
  - UserRepository, UserService, and UserAdminService to handle user lookup, team views, and HR user CRUD.
  - EmployeeCodeGenerator for consistent employee codes (e.g. EMP001, EMP002) and LdapProvisioningService prepared for LDAP provisioning.
  - UserResource and UserAdminResource REST APIs so HR can list users, create new users, and edit users (name, role, department, mustChangePassword, active state).
  - HR User Administration screen in React to manage users (table + add/edit dialogs) wired to the admin endpoints.

***

## Tech Stack

Backend

- Java 17+
- Maven (single module)
- Jakarta EE (JAX-RS, JPA, EJB later, SOAP later)
- JPA / Hibernate (MySQL)
- WildFly 38.0.1.Final
- Elytron + LDAP (OpenLDAP on polytech.ddns.net)

Frontend

- React (Vite)
- TypeScript (if enabled in template)
- Tailwind / shadcn/ui
- react-hot-toast (notifications)
- ldrs (loading indicators)

Infrastructure

- OpenLDAP server: polytech.ddns.net
- MySQL 8: polytech.ddns.net
- Docker / CI: planned
- Arquillian / integration tests: planned

***

## Project Structure

/

- backend/                Jakarta EE backend (single Maven module)
    - src/main/java/...     REST resources, services, JPA entities
    - src/main/resources/   persistence.xml, configs
    - pom.xml
- frontend/leave-frontend/ React app (Vite)
    - src/
    - package.json

***

## External Services

### MySQL

- Host: polytech.ddns.net
- Port: 3306
- Database: leave_management
- Charset: utf8mb4

Tables currently used:

- departments
- users

users.employee_code matches LDAP uid (e.g. EMP001, EMP002, EMP003).

### LDAP (OpenLDAP)

- Host: polytech.ddns.net
- Port: 389
- Base DN: dc=polytech,dc=local
- Users: ou=Users,dc=polytech,dc=local
- Groups: ou=Groups,dc=polytech,dc=local

Groups:

- cn=EMPLOYEE,ou=Groups,dc=polytech,dc=local
- cn=MANAGER,ou=Groups,dc=polytech,dc=local
- cn=HR,ou=Groups,dc=polytech,dc=local

Each group is objectClass=groupOfNames and has member DNs like:

dn: cn=EMPLOYEE,ou=Groups,dc=polytech,dc=local
objectClass: groupOfNames
cn: EMPLOYEE
member: uid=EMP001,ou=Users,dc=polytech,dc=local

Users are inetOrgPerson with uid (EMP001, EMP002, EMP003) and encrypted userPassword.

***

## Backend (Jakarta EE) Setup

### Prerequisites

- JDK 17+
- Maven 3.9+
- WildFly 38.0.1.Final (important – configs match this)


### WildFly – MySQL datasource

1) Add MySQL driver (mysql-connector-j-8.0.33.jar) to WildFly (as a module or as a deployment).
2) Create datasource:

- Name: MySQLDS
- JNDI: java:jboss/datasources/MySQLDS
- Connection URL (example):
jdbc:mysql://polytech.ddns.net:3306/leave_management?useSSL=false\&allowPublicKeyRetrieval=true\&serverTimezone=UTC
- User/password: shared MySQL account for the project.

3) Test the datasource in the WildFly admin console.

### WildFly – Elytron LDAP security

Elytron realm:

- dir-context → points to polytech.ddns.net LDAP
- identity-mapping:
    - search-base-dn = ou=Users,dc=polytech,dc=local
    - rdn-identifier = uid
    - attribute-mapping:
        - from = cn
        - to = Roles
        - filter-base-dn = ou=Groups,dc=polytech,dc=local
        - filter = (\&(objectClass=groupOfNames)(member={1}))

This makes LDAP groups EMPLOYEE, MANAGER, HR available as application roles.

HTTP auth:

- HTTP authentication factory using BASIC auth and the LDAP realm.
- Undertow application-security-domain bound to the deployed WAR.

The web app refers to this security domain in WEB-INF/jboss-web.xml, for example:

<jboss-web xmlns="urn:jboss:domain:jboss-.0">  
    <context-root>leave-management-backend</context-root>  
    <security-domain>leaveAppDomain</security-domain>  
</jboss-web>

### Backend build

From backend/:

mvn clean package

This produces a WAR (e.g. target/leave-management-backend.war).

### Deploy to WildFly

1) Start WildFly 38.0.1.Final (standalone).
2) Copy:

backend/target/leave-management-backend.war

to:

WILDFLY_HOME/standalone/deployments/

3) Check server.log:

- No errors about java:jboss/datasources/MySQLDS
- No Elytron/LDAP errors
- leave-management-backend deployed successfully

***

## Backend – Implemented in Sprint 1

- GET /api/auth/me (JAX-RS):
    - Protected by roles: EMPLOYEE, MANAGER, HR
    - Uses LDAP auth + MySQL users table (via employee_code)
    - Returns JSON with:
        - id
        - employeeCode
        - firstName
        - lastName
        - role
        - departmentId
- CORS filter:
    - Allows calls from React dev server (http://localhost:5173)
    - Handles preflight (OPTIONS)
- DB seeding:
    - Departments and three users (EMP001/2/3) that match LDAP entries

***

## Frontend (React) Setup

### Prerequisites

- Node.js 18+
- npm or pnpm


### Install and run

From frontend/leave-frontend/:

npm install
npm run dev

Default dev URL: http://localhost:5173

The frontend expects backend API at:

http://localhost:8080/leave-management-backend/api

Update API_BASE in src/api/auth.ts if needed.

### Frontend – Implemented in Sprint 1

Login

- LoginForm asks for:
    - Username (LDAP uid, e.g. EMP001)
    - Password
- Calls GET /auth/me with HTTP Basic Auth header.
- On success:
    - Stores { user, authHeader } in sessionStorage (keys: lm_user, lm_auth).
    - Shows success toast via react-hot-toast.
- On error:
    - Shows error toast (invalid credentials, forbidden, server error).

Session (UI)

- On app start:
    - Reads lm_user and lm_auth from sessionStorage.
    - If found and valid, treats the user as logged in.
- Logout:
    - Clears sessionStorage.
    - Returns to login screen.

Dashboard

- App:
    - If user exists → show Dashboard
    - If no user → show Login
- Dashboard:
    - Shows header with logged-in user (name, employeeCode, role)
    - Renders role-specific dashboard shell:
        - EmployeeDashboard / ManagerDashboard / HRDashboard (basic placeholder content)
    - Sidebar (AppSidebar):
        - Uses user data (from sessionStorage) in NavUser (name + synthetic email)
        - Static nav items (My Leave Requests, Team, Reports) – to be connected later

Loading

- Uses ldrs (e.g. <l-helix> spinner) inside buttons during network calls.

Notifications

- Uses react-hot-toast for login success/failure.

***

## How to Run Everything (Team Member Checklist)

1) Backend

- Install JDK 17+, Maven 3.9+, WildFly 38.0.1.Final.
- Ensure network access to:
    - polytech.ddns.net:3306 (MySQL)
    - polytech.ddns.net:389 (LDAP)
- Configure WildFly:
    - MySQL driver + MySQLDS datasource.
    - Elytron LDAP realm and HTTP BASIC auth factory.
    - Application security-domain bound to the WAR.
- Build and deploy:
    - cd backend
    - mvn clean package
    - copy WAR to WildFly deployments

2) Frontend

- cd frontend/leave-frontend
- npm install
- npm run dev
- Open http://localhost:5173
- Log in with an LDAP user (e.g. EMP001 + its password from LDAP).

3) Smoke test

- From browser DevTools / Network:
    - GET http://localhost:8080/leave-management-backend/api/auth/me returns 200 with JSON
- React app:
    - Login form works.
    - Dashboard shows correct name and role.
    - Sidebar shows the same user.

***

## Next Steps (Future Sprints)

- Design and implement leave_requests entity and JPA mapping.
- Add EJB services for leave workflow (create / approve / reject).
- Expose:
    - REST endpoints for employees, managers, HR.
    - SOAP endpoints (JAX-WS) for external integration.
- Integrate JMS for notifications.
- Connect React dashboards to real leave data (history, balances, approvals).

