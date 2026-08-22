import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
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

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [attAnalytics, setAttAnalytics] = useState(null);
  const [leaveAnalytics, setLeaveAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDeptFactors, setSelectedDeptFactors] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const [ovRes, attRes, leaveRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/attendance'),
        api.get('/api/analytics/leaves'),
      ]);
      setOverview(ovRes.data);
      setAttAnalytics(attRes.data);
      setLeaveAnalytics(leaveRes.data);
    } catch (err) {
      setError('Failed to fetch workforce analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loading message="Computing workforce operational analytics & department health scores..." />;
  if (error) return <div style={{ color: '#ef4444', fontWeight: 600, padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Workforce Intelligence Analytics
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Quantitative operational metrics, department health scores, and availability trends.
          </p>
        </div>
      </div>

      {/* SECTION A: WORKFORCE OVERVIEW */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>
          A. Organization Workforce Overview
        </h4>
        <div className="grid-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <StatCard
            title="Headcount"
            value={overview.total_employees}
            subtitle="Total registered"
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Active Workforce"
            value={overview.active_employees}
            subtitle="Active accounts"
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Departments"
            value={overview.total_departments}
            subtitle="Operational units"
            icon={BarChart2}
            color="cyan"
          />
          <StatCard
            title="Org Attendance Rate"
            value={`${overview.organization_attendance_pct}%`}
            subtitle="Overall compliance"
            icon={TrendingUp}
            color="indigo"
          />
          <StatCard
            title="Requires Attention"
            value={overview.employees_needing_attention_count}
            subtitle="Employees below target"
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      </div>

      {/* SECTION B: ATTENDANCE ANALYTICS */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>
          B. Attendance & Availability Analytics
        </h4>
        <div className="grid-2">
          {/* Department Comparison Bar Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h4 className="card-title">Department Attendance Rate Comparison</h4>
                <p className="card-subtitle">Operational attendance compliance by department (%)</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={attAnalytics.department_comparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="attendance_percentage" name="Attendance %" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Donut Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h4 className="card-title">Overall Status Distribution</h4>
                <p className="card-subtitle">Breakdown of total recorded attendance statuses</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={attAnalytics.status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attAnalytics.status_distribution.map((entry, index) => (
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
      </div>

      {/* SECTION C: LEAVE ANALYTICS */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>
          C. Leave Request Governance Breakdown
        </h4>
        <div className="grid-3">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Paid Leaves Logged</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5' }}>{leaveAnalytics.paid_leave_count}</h3>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sick Leaves Logged</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{leaveAnalytics.sick_leave_count}</h3>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Unpaid Leaves Logged</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{leaveAnalytics.unpaid_leave_count}</h3>
          </div>
        </div>
      </div>

      {/* SECTION D: DEPARTMENT HEALTH SCORES */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              D. Department Health Scores & Factors
            </h4>
            <p style={{ fontSize: '0.775rem', color: '#64748b' }}>
              Calculated using formula: <code>Health Score = int(Attendance% * 0.6 + Availability% * 0.4)</code>
            </p>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Headcount</th>
                  <th>Attendance %</th>
                  <th>Availability Rate</th>
                  <th>Avg Daily Hours</th>
                  <th>Health Score (0-100)</th>
                  <th>Status</th>
                  <th>Factors</th>
                </tr>
              </thead>
              <tbody>
                {overview.department_health_scores.map((dh) => (
                  <tr key={dh.department}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{dh.department}</td>
                    <td>{dh.employee_count} employees</td>
                    <td style={{ fontWeight: 700 }}>{dh.attendance_percentage}%</td>
                    <td>{dh.availability_rate}%</td>
                    <td>{dh.avg_working_hours} hrs</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', backgroundColor: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${dh.health_score}%`,
                              height: '100%',
                              backgroundColor: dh.health_score >= 80 ? '#10b981' : dh.health_score >= 60 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{dh.health_score} / 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${dh.status === 'HEALTHY' ? 'approved' : dh.status === 'WATCH' ? 'pending' : 'rejected'}`}>
                        {dh.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDeptFactors(dh)}
                        className="btn btn-secondary btn-sm"
                      >
                        Inspect Factors
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Factors Modal */}
      {selectedDeptFactors && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Department Health Score Calculation</h3>
              <button onClick={() => setSelectedDeptFactors(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {selectedDeptFactors.department} Department
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Score: <strong>{selectedDeptFactors.health_score} / 100</strong> ({selectedDeptFactors.status})
              </p>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>
                  Calculation Formula
                </span>
                <p style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  Health Score = Attendance Rate (60%) + Workforce Availability (40%)
                </p>
              </div>

              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Calculated Factors:</span>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {selectedDeptFactors.factors.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedDeptFactors(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
