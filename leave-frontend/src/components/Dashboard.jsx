import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';

export default function Dashboard({ user }) {
  if (!user) return null;

  if (user.role === 'EMPLOYEE') {
    return <EmployeeDashboard user={user} />;
  }
  if (user.role === 'MANAGER') {
    return <ManagerDashboard user={user} />;
  }
  if (user.role === 'HR') {
    return <HRDashboard user={user} />;
  }

  return (
    <div>
      <h2>Unknown role</h2>
      <p>Role: {user.role}</p>
    </div>
  );
}
