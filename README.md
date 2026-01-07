# Leave Management System (JEE)

## Tech Stack
- Java 17
- Maven (multi-module)
- Jakarta EE / JEE
- EJB (business logic)
- SOAP (WSDL-based services)
- JMS (asynchronous notifications)
- JSP/Servlet Web Module
- EAR packaging
- WildFly (runtime - to be installed)
- Arquillian (testing – planned)
- Docker (CI / deployment – planned)

## Project Structure
backend/
- core   : EJB business logic
- soap   : SOAP web services
- jms    : JMS producers/consumers
- web    : Web layer (WAR)
- ear    : Enterprise archive (EAR)

## Prerequisites
- JDK 17
- Maven 3.9+
- WildFly 32+

## Build
```bash
cd backend
mvn clean install
