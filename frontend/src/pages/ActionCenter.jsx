import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function ActionCenter() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/insights/actions');
      setActions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const filteredActions = actions.filter((act) => {
    if (priorityFilter !== 'ALL' && act.priority !== priorityFilter) return false;
    if (categoryFilter !== 'ALL' && act.category !== categoryFilter) return false;
    return true;
  });

  if (loading) return <Loading message="Analyzing workforce records and computing action priorities..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Dayflow Action Center
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Deterministically prioritized workforce situations requiring HR governance.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Priority:</span>
          <select
            className="form-control"
            style={{ width: '140px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Category:</span>
          <select
            className="form-control"
            style={{ width: '160px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="LEAVE">Leave</option>
            <option value="WORKFORCE">Workforce</option>
            <option value="PAYROLL">Payroll</option>
          </select>
        </div>
      </div>

      {/* Action Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredActions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
            No workforce action items match the selected priority and category filters.
          </div>
        ) : (
          filteredActions.map((act) => (
            <div
              key={act.id}
              className="card"
              style={{
                borderLeft: `4px solid ${act.priority === 'HIGH' ? '#ef4444' : act.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                  <span className={`badge badge-${act.priority === 'HIGH' ? 'rejected' : act.priority === 'MEDIUM' ? 'pending' : 'approved'}`}>
                    Priority: {act.priority}
                  </span>
                  <span className="badge badge-info">{act.category}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Target: {act.related_target}</span>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{act.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.375rem', lineHeight: 1.5 }}>
                  {act.explanation}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  maxWidth: '360px',
                  width: '100%',
                }}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.05em' }}>
                  Recommended Action
                </div>
                <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, marginTop: '0.25rem' }}>
                  {act.recommended_action}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
