export default function EmployeeDashboard({ user }) {
  return (
    <div>
      <h2>Employee Dashboard</h2>
      <p>Welcome, {user.firstName} {user.lastName}.</p>
      <p>Your role: {user.role}</p>
      <p>Here you will submit and track your leave requests.</p>
    </div>
  );
}
