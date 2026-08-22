import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, Filter, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('User@123');
  const [employeeCode, setEmployeeCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deptField, setDeptField] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState(7500);
  const [allowances, setAllowances] = useState(1000);
  const [deductions, setDeductions] = useState(500);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (department) queryParams.append('department', department);

      const res = await api.get(`/api/employees?${queryParams.toString()}`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !employeeCode || !designation) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/employees', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        employee_code: employeeCode,
        phone,
        address,
        department: deptField,
        designation,
        joining_date: joiningDate,
        basic_salary: parseFloat(basicSalary),
        allowances: parseFloat(allowances),
        deductions: parseFloat(deductions),
      });

      setShowModal(false);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setEmployeeCode('');
      setDesignation('');
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add new employee.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && employees.length === 0) return <Loading message="Loading employee directory..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Employee Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage all organization profiles and user accounts.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filter Card */}
      <div className="card">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by name, email, or employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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

          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      {/* Employees Grid */}
      <div className="grid-3">
        {employees.map((emp) => (
          <div key={emp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img
                  src={emp.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={emp.full_name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{emp.full_name}</h4>
                  <span className="badge badge-info" style={{ marginTop: '0.25rem' }}>{emp.employee_code}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div><strong>Department:</strong> {emp.department}</div>
                <div><strong>Designation:</strong> {emp.designation}</div>
                <div><strong>Email:</strong> {emp.email}</div>
                <div><strong>Phone:</strong> {emp.phone || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="btn btn-secondary btn-sm"
              >
                Inspect Details <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Employee Profile</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                {error && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 600 }}>
                    {error}
                  </div>
                )}

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
                    <label className="form-label">Work Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee Code</label>
                    <input type="text" className="form-control" placeholder="EMP-200" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Account Password</label>
                    <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-control" value={deptField} onChange={(e) => setDeptField(e.target.value)}>
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-control" placeholder="Senior Developer" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" className="form-control" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', color: '#0f172a' }}>Initial Salary Details</h4>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Basic Salary ($)</label>
                    <input type="number" className="form-control" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Allowances ($)</label>
                    <input type="number" className="form-control" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deductions ($)</label>
                    <input type="number" className="form-control" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating Account...' : 'Create Employee Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
