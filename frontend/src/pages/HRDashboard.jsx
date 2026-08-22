import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHRData = async () => {
    try {
      const [dashRes, actionRes] = await Promise.all([
        api.get('/api/dashboard/hr'),
        api.get('/api/insights/actions'),
      ]);
      setData(dashRes.data);
      setActions(actionRes.data);
    } catch (err) {
      setError('Failed to fetch HR dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  const handleQuickApprove = async (leaveId) => {
    try {
      await api.put(`/api/leaves/${leaveId}/approve`, { admin_comment: 'Approved via HR Dashboard quick review.' });
      fetchHRData();
    } catch (err) {
      alert('Action failed.');
    }
  };

  const handleQuickReject = async (leaveId) => {
    try {
      await api.put(`/api/leaves/${leaveId}/reject`, { admin_comment: 'Rejected via HR Dashboard quick review.' });
      fetchHRData();
    } catch (err) {
      alert('Action failed.');
    }
  };

  if (loading) return <Loading message="Loading HR Executive Dashboard & Intelligence Layer..." />;
  if (error) return <div style={{ color: '#ef4444', fontWeight: 600, padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            HR Executive Command Center
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Real-time workforce operational intelligence, action items & governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/action-center')} className="btn btn-primary">
            <ShieldAlert size={18} /> Action Center ({actions.length})
          </button>
          <button onClick={() => navigate('/analytics')} className="btn btn-secondary">
            <BarChart2 size={18} /> Workforce Analytics
          </button>
        </div>
      </div>

      {/* Top 5 Executive Metric Cards */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <StatCard
          title="Total Headcount"
          value={data.total_employees}
          subtitle="Active workforce"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={data.present_today}
          subtitle="Checked in & active"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={data.absent_today}
          subtitle="Unexcused absence"
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="On Leave"
          value={data.on_leave_today}
          subtitle="Approved leave today"
          icon={CalendarDays}
          color="cyan"
        />
        <StatCard
          title="Pending Requests"
          value={data.pending_leaves_count}
          subtitle="Requires HR decision"
          icon={FileCheck2}
          color="amber"
        />
      </div>

      {/* DAYFLOW ACTION CENTER WIDGET */}
      <div className="card" style={{ borderLeft: '4px solid #4f46e5', backgroundColor: '#ffffff' }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h4 className="card-title" style={{ color: '#0f172a' }}>
              <ShieldAlert size={20} color="#4f46e5" /> Dayflow Action Center Highlights
            </h4>
            <p className="card-subtitle">Calculated workforce operational priorities requiring attention</p>
          </div>
          <button onClick={() => navigate('/action-center')} className="btn btn-secondary btn-sm">
            View All Action Items <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {actions.slice(0, 3).map((act) => (
            <div
              key={act.id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                  <span
                    className={`badge badge-${act.priority === 'HIGH' ? 'rejected' : act.priority === 'MEDIUM' ? 'pending' : 'approved'}`}
                  >
                    Priority: {act.priority}
                  </span>
                  <span className="badge badge-info">{act.category}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Target: {act.related_target}</span>
                </div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{act.title}</h5>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{act.explanation}</p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '320px' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#4f46e5' }}>
                  Recommended Action
                </span>
                <p style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, marginTop: '0.125rem' }}>
                  {act.recommended_action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharts Graphical Section */}
      <div className="grid-2">
        {/* Weekly Attendance Trend Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <TrendingUp size={20} color="#4f46e5" /> Weekly Attendance Trend
              </h4>
              <p className="card-subtitle">Daily distribution over past 7 calendar days</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.weekly_attendance_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="half_day" name="Half-Day" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" name="On Leave" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Status Distribution Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">
                <PieIcon size={20} color="#6366f1" /> Leave Request Types
              </h4>
              <p className="card-subtitle">Breakdown of submitted leave requests</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.leave_status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.leave_status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Governance Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h4 className="card-title">Pending Leave Approval Queue</h4>
            <p className="card-subtitle">Review employee leave applications</p>
          </div>
          <button onClick={() => navigate('/leave-approvals')} className="btn btn-secondary btn-sm">
            View All Requests <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {data.pending_leave_requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No pending leave requests requiring review.
                  </td>
                </tr>
              ) : (
                data.pending_leave_requests.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.employee_code}</div>
                    </td>
                    <td>{l.department}</td>
                    <td><span className="badge badge-info">{l.leave_type}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{l.start_date} to {l.end_date}</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.reason}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleQuickApprove(l.id)}
                          className="btn btn-success btn-sm"
                          title="Approve"
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleQuickReject(l.id)}
                          className="btn btn-danger btn-sm"
                          title="Reject"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
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
