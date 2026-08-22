import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function Attendance({ user }) {
  const isHR = user?.role === 'HR_ADMIN';

  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      if (isHR) {
        const queryParams = new URLSearchParams();
        if (department) queryParams.append('department', department);
        const res = await api.get(`/api/attendance/all?${queryParams.toString()}`);
        setAttendances(res.data);
      } else {
        const [myRes, statsRes] = await Promise.all([
          api.get('/api/attendance/my'),
          api.get('/api/attendance/stats'),
        ]);
        setAttendances(myRes.data);
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [department, user]);

  const filteredAttendances = attendances.filter((att) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (att.employee_name && att.employee_name.toLowerCase().includes(term)) ||
      (att.employee_code && att.employee_code.toLowerCase().includes(term)) ||
      (att.status && att.status.toLowerCase().includes(term))
    );
  });

  if (loading) return <Loading message="Loading attendance records..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {isHR ? 'Master Organization Attendance' : 'Personal Attendance History'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {isHR ? 'Monitor check-in logs and working hours for all employees' : 'View your daily workday check-in timestamps and totals'}
          </p>
        </div>
      </div>

      {/* Stats row for Employees */}
      {!isHR && stats && (
        <div className="grid-4">
          <div className="card">
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Working Days</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total_working_days}</h3>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Present Days</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats.present_days}</h3>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Half Days</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats.half_days}</h3>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Attendance Rate</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>{stats.attendance_percentage}%</h3>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by employee name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isHR && (
          <select
            className="form-control"
            style={{ width: '220px' }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        )}
      </div>

      {/* Attendance Logs Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                {isHR && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 6 : 5} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => (
                  <tr key={att.id}>
                    {isHR && (
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{att.employee_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{att.employee_code} ({att.department})</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{att.attendance_date}</td>
                    <td>{new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td style={{ fontWeight: 700 }}>{att.working_hours} hrs</td>
                    <td>
                      <span className={`badge badge-${att.status.toLowerCase().replace(' ', '-')}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
