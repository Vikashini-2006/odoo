import React, { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, XCircle, Filter, MessageSquare } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/leaves?status=${statusFilter}` : '/api/leaves';
      const res = await api.get(url);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleOpenActionModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setAdminComment('');
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedLeave || !actionType) return;

    setSubmitting(true);
    try {
      const endpoint = `/api/leaves/${selectedLeave.id}/${actionType}`;
      await api.put(endpoint, { admin_comment: adminComment.trim() });
      setSelectedLeave(null);
      setActionType(null);
      fetchLeaves();
    } catch (err) {
      alert('Failed to process leave decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading leave applications for HR review..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Leave Request Governance</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review, approve, or reject employee leave applications.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Filter size={18} color="#64748b" />
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Status:</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            >
              {st || 'All Requests'}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Queue Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No leave requests found matching selected filter.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.employee_code} ({l.department})</div>
                    </td>
                    <td><span className="badge badge-info">{l.leave_type}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{l.start_date} to {l.end_date}</td>
                    <td style={{ maxWidth: '220px' }}>{l.reason}</td>
                    <td>
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ color: l.admin_comment ? '#0f172a' : '#94a3b8', fontStyle: l.admin_comment ? 'normal' : 'italic' }}>
                      {l.admin_comment || 'None'}
                    </td>
                    <td>
                      {l.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenActionModal(l, 'approve')}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(l, 'reject')}
                            className="btn btn-danger btn-sm"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Decision Finalized</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button onClick={() => setSelectedLeave(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <form onSubmit={handleExecuteAction}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  You are about to <strong>{actionType}</strong> the <strong>{selectedLeave.leave_type}</strong> application for <strong>{selectedLeave.employee_name}</strong> ({selectedLeave.start_date} to {selectedLeave.end_date}).
                </p>

                <div className="form-group">
                  <label className="form-label">Administrator Note / Comment</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Add an optional comment for the employee..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedLeave(null)} className="btn btn-secondary">Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                >
                  {submitting ? 'Saving...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
