import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import Loading from '../components/Loading';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/api/employees/${id}`),
      api.get(`/api/insights/employee/${id}`),
    ])
      .then(([empRes, insRes]) => {
        const emp = empRes.data;
        setEmployee(emp);
        setInsight(insRes.data);
        setFirstName(emp.first_name || '');
        setLastName(emp.last_name || '');
        setPhone(emp.phone || '');
        setAddress(emp.address || '');
        setDepartment(emp.department || '');
        setDesignation(emp.designation || '');
        setProfileImage(emp.profile_image || '');
      })
      .catch(() => navigate('/employees'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await api.put(`/api/employees/${id}`, {
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        department,
        designation,
        profile_image: profileImage,
      });

      setEmployee(response.data);
      setMessage({ type: 'success', text: 'Employee details updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update employee details.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading employee inspection profile & operational insights..." />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <button onClick={() => navigate('/employees')} className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* Header Info Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{employee?.full_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge badge-info">{employee?.employee_code}</span>
              <span className="badge badge-leave">{employee?.department}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.375rem' }}>
              Official Email: <strong>{employee?.email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* EMPLOYEE INSIGHT PANEL */}
      {insight && (
        <div className="card" style={{ borderLeft: `4px solid ${insight.operational_status === 'HEALTHY' ? '#10b981' : insight.operational_status === 'NEEDS_ATTENTION' ? '#f59e0b' : '#ef4444'}` }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h4 className="card-title">
                <Activity size={20} color="#4f46e5" /> Operational Employee Insights
              </h4>
              <p className="card-subtitle">Calculated metrics & operational attendance classification</p>
            </div>
            <span className={`badge badge-${insight.operational_status === 'HEALTHY' ? 'approved' : insight.operational_status === 'NEEDS_ATTENTION' ? 'pending' : 'rejected'}`}>
              Status: {insight.operational_status}
            </span>
          </div>

          <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Attendance Rate</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.125rem' }}>
                {insight.attendance_percentage}%
              </h4>
              <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Dept Avg: {insight.dept_avg_attendance}%</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Present / Absent</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.125rem' }}>
                {insight.present_days} / {insight.absent_days}
              </h4>
              <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Half-Days: {insight.half_days}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Avg Daily Hours</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.125rem' }}>
                {insight.avg_working_hours} hrs
              </h4>
              <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Consecutive Abs: {insight.consecutive_absences}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Leaves</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1', marginTop: '0.125rem' }}>
                {insight.leave_count}
              </h4>
              <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Pending: {insight.pending_leave_count}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#4f46e5' }}>
                Reason & Recommended Action
              </span>
              <p style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, marginTop: '0.25rem' }}>
                {insight.status_reason}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                <strong>Action:</strong> {insight.recommended_action}
              </p>
            </div>

            {/* Recent Trend Mini Chart */}
            <div style={{ width: '100%', height: 100 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Recent Work Hours Trend</span>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={insight.recent_trend}>
                  <Bar dataKey="hours" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Editor Card */}
      <div className="card">
        {message && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            HR Organizational & Personal Details Editor
          </h4>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input type="text" className="form-control" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <input type="text" className="form-control" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={18} /> {saving ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
