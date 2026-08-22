import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [leaveType, setLeaveType] = useState('Paid Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/api/leaves/my');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/leaves', {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      });
      setShowModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchMyLeaves();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading leave applications..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Personal Leave Requests</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Submit leave applications and track HR review status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Comment</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No leave requests submitted yet. Click "Apply for Leave" to get started.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.leave_type}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td style={{ maxWidth: '240px' }}>{l.reason}</td>
                    <td>
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ color: l.admin_comment ? '#0f172a' : '#94a3b8', fontStyle: l.admin_comment ? 'normal' : 'italic' }}>
                      {l.admin_comment || 'No comment added'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Apply for Time Off</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                    <option value="Paid Leave">Paid Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Request</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Briefly explain the reason for your leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
