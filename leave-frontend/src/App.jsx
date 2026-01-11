import { useState } from 'react';
import { fetchCurrentUser } from './api/auth';
import Dashboard from './components/Dashboard';

function App() {
  const [username, setUsername] = useState('EMP001');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [authHeader, setAuthHeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, authHeader } = await fetchCurrentUser(username, password);
      setUser(user);
      setAuthHeader(authHeader);
    } catch (err) {
      setError(err.message);
      setUser(null);
      setAuthHeader(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthHeader(null);
    setPassword('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1>Leave Management</h1>

      {!user && (
        <form onSubmit={handleLogin}>
          <div>
            <label>
              Username (LDAP uid):
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}

      {user && (
        <>
          <div style={{ marginTop: 16 }}>
            <p>
              Logged in as {user.firstName} {user.lastName} ({user.employeeCode}) –{' '}
              role: {user.role}
            </p>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <hr />

          <Dashboard user={user} />
        </>
      )}
    </div>
  );
}

export default App;