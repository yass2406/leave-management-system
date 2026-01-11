export default function HRDashboard({ user }) {
  return (
    <div>
      <h2>HR Dashboard</h2>
      <p>Welcome, {user.firstName} {user.lastName}.</p>
      <p>Your role: {user.role}</p>
      <p>Here you will manage policies and global leave data.</p>
    </div>
  );
}
