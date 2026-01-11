export default function ManagerDashboard({ user }) {
  return (
    <div>
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user.firstName} {user.lastName}.</p>
      <p>Your role: {user.role}</p>
      <p>Here you will review and approve team leave requests.</p>
    </div>
  );
}
