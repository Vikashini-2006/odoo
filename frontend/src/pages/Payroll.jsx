import React, { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, Calculator, CheckCircle2 } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function Payroll({ user }) {
  const isHR = user?.role === 'HR_ADMIN';

  const [payrolls, setPayrolls] = useState([]);
  const [myPayroll, setMyPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State for HR
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [basic, setBasic] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      if (isHR) {
        const res = await api.get('/api/payroll');
        setPayrolls(res.data);
      } else {
        const res = await api.get('/api/payroll/my');
        setMyPayroll(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [user]);

  const handleOpenEdit = (pr) => {
    setSelectedPayroll(pr);
    setBasic(pr.basic_salary);
    setAllowances(pr.allowances);
    setDeductions(pr.deductions);
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    setSaving(true);
    try {
      await api.put(`/api/payroll/${selectedPayroll.employee_id}`, {
        basic_salary: parseFloat(basic),
        allowances: parseFloat(allowances),
        deductions: parseFloat(deductions),
      });
      setSelectedPayroll(null);
      fetchPayrollData();
    } catch (err) {
      alert('Failed to update salary figures.');
    } finally {
      setSaving(false);
    }
  };

  const calculatedNet = Math.max(0, (parseFloat(basic) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0));

  if (loading) return <Loading message="Loading compensation statements..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {isHR ? 'Organization Payroll Management' : 'My Compensation Statement'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {isHR ? 'Manage basic salary, allowances, and deductions across the organization' : 'Official breakdown of your monthly salary components'}
          </p>
        </div>
      </div>

      {/* Employee View: Read-Only Salary Breakdown */}
      {!isHR && myPayroll && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-4">
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Basic Salary</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>${myPayroll.basic_salary.toLocaleString()}</h3>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Allowances (+)</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>+${myPayroll.allowances.toLocaleString()}</h3>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Deductions (-)</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>-${myPayroll.deductions.toLocaleString()}</h3>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: '#ffffff' }}>
              <span style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 700 }}>Net Salary</span>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 800 }}>${myPayroll.net_salary.toLocaleString()}</h3>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
              Direct Deposit Statement Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Employee Code</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{myPayroll.employee_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Designation</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{myPayroll.designation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Basic Compensation</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>${myPayroll.basic_salary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Housing & Transit Allowances</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>+${myPayroll.allowances.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Tax & Statutory Deductions</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>-${myPayroll.deductions.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0.25rem 0' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Total Calculated Net Payout</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>${myPayroll.net_salary.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR View: Master Payroll Table */}
      {isHR && (
        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((pr) => (
                  <tr key={pr.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{pr.employee_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pr.employee_code} ({pr.designation})</div>
                    </td>
                    <td>{pr.department}</td>
                    <td style={{ fontWeight: 600 }}>${pr.basic_salary.toLocaleString()}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>+${pr.allowances.toLocaleString()}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>-${pr.deductions.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: '#4f46e5' }}>${pr.net_salary.toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleOpenEdit(pr)} className="btn btn-secondary btn-sm">
                        <Edit size={16} /> Edit Salary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HR Edit Salary Modal */}
      {selectedPayroll && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Update Salary - {selectedPayroll.employee_name}</h3>
              <button onClick={() => setSelectedPayroll(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <form onSubmit={handleSavePayroll}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  Updating payroll for <strong>{selectedPayroll.employee_name}</strong> ({selectedPayroll.employee_code}). Net salary is updated automatically.
                </p>

                <div className="form-group">
                  <label className="form-label">Basic Salary ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={basic}
                    onChange={(e) => setBasic(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Allowances ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deductions ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    required
                  />
                </div>

                {/* Calculation preview */}
                <div
                  style={{
                    backgroundColor: '#eef2ff',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #c7d2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 700 }}>
                    <Calculator size={18} /> Calculated Net Salary:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                    ${calculatedNet.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedPayroll(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Updating...' : 'Save Salary Figures'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
