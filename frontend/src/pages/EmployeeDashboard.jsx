import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import api from '../api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/api/dashboard/employee');
      setData(response.data);
      if (response.data?.payroll_summary?.employee_id) {
        const insRes = await api.get(`/api/insights/employee/${response.data.payroll_summary.employee_id}`);
        setInsight(insRes.data);
      }
    } catch (err) {
      setError('Failed to load employee dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/api/attendance/check-in');
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/api/attendance/check-out');
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading message="Preparing your personal Dayflow workspace..." />;
  if (error) return <div style={{ color: '#ef4444', fontWeight: 600, padding: '2rem' }}>{error}</div>;

  const todayAtt = data?.today_attendance;
  const isCheckedIn = todayAtt && !todayAtt.check_out;
  const isCheckedOut = todayAtt && todayAtt.check_out;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> DAYFLOW WORKSPACE
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {data.welcome_message}
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {data.current_date}
          </p>
        </div>

        {/* Live Clock Card */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 600 }}>System Standard Time</div>
        </div>
      </div>

      {/* Attendance Control Widget */}
      <div className="card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Today's Workday Attendance</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            {!todayAtt
              ? 'You have not checked in for today yet.'
              : isCheckedIn
              ? `Checked in at ${new Date(todayAtt.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : `Workday completed. Total hours: ${todayAtt.working_hours} hrs`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!todayAtt && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="btn btn-success btn-lg"
            >
              <CheckCircle size={20} />
              {actionLoading ? 'Processing...' : 'Check In Now'}
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="btn btn-danger btn-lg"
            >
              <Clock size={20} />
              {actionLoading ? 'Processing...' : 'Check Out'}
            </button>
          )}

          {isCheckedOut && (
            <div className="badge badge-present" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
              <CheckCircle size={18} /> Attendance Completed for Today
            </div>
          )}
        </div>
      </div>

      {/* Employee Personal Self-Insights Card */}
      {insight && (
        <div className="card" style={{ borderLeft: '4px solid #4f46e5', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#4f46e5" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Personal Workday Insights</h4>
            </div>
            <span className={`badge badge-${insight.operational_status === 'HEALTHY' ? 'approved' : 'pending'}`}>
              Operational Status: {insight.operational_status}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
            Your current attendance rate is <strong>{insight.attendance_percentage}%</strong> with an average of <strong>{insight.avg_working_hours} hrs/day</strong> logged. {insight.status_reason}
          </p>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid-4">
        <StatCard
          title="Attendance Rate"
          value={`${data.attendance_stats.attendance_percentage}%`}
          subtitle={`${data.attendance_stats.present_days} present of ${data.attendance_stats.total_working_days} days`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Approved Leaves"
          value={data.approved_leaves_count}
          subtitle="Processed leave balance"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={data.pending_leaves_count}
          subtitle="Awaiting HR review"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Net Monthly Salary"
          value={`$${(data.payroll_summary?.net_salary || 0).toLocaleString()}`}
          subtitle="Direct deposit ready"
          icon={DollarSign}
          color="cyan"
        />
      </div>

      {/* Tables Section */}
      <div className="grid-2">
        {/* Recent Attendance History */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">Recent Attendance</h4>
              <p className="card-subtitle">Last 7 recorded workdays</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_attendance.map((att) => (
                  <tr key={att.id}>
                    <td>{att.attendance_date}</td>
                    <td>{new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>
                      <span className={`badge badge-${att.status.toLowerCase().replace(' ', '-')}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <h4 className="card-title">Recent Leave Requests</h4>
              <p className="card-subtitle">Status & administrator notes</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_leaves.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.leave_type}</td>
                    <td style={{ fontSize: '0.775rem' }}>{l.start_date} to {l.end_date}</td>
                    <td>
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
