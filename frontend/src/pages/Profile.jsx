import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Briefcase, Calendar, Save, Camera } from 'lucide-react';
import api from '../api';
import Loading from '../components/Loading';

export default function Profile({ user, onUserUpdated }) {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.employee_id) {
      api.get(`/api/employees/${user.employee_id}`)
        .then((res) => {
          setProfile(res.data);
          setPhone(res.data.phone || '');
          setAddress(res.data.address || '');
          setProfileImage(res.data.profile_image || '');
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await api.put(`/api/employees/${profile.id}`, {
        phone,
        address,
        profile_image: profileImage,
      });

      setProfile(response.data);
      setMessage({ type: 'success', text: 'Profile contact details updated successfully!' });
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading profile information..." />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <img
            src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile Avatar"
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }}
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{profile?.full_name || user?.full_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge badge-leave">{profile?.department}</span>
              <span className="badge badge-info">{profile?.designation}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              Employee Code: <strong>{profile?.employee_code}</strong> | Joined: {profile?.joining_date}
            </p>
          </div>
        </div>

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

        <form onSubmit={handleSave}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Editable Contact Details
          </h4>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Street Name, City, State"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <div style={{ position: 'relative' }}>
              <Camera size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '1.5rem 0 1rem 0' }}>
            Organization Information (Read-Only)
          </h4>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input type="text" className="form-control" value={profile?.email || ''} disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" className="form-control" value={profile?.department || ''} disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input type="text" className="form-control" value={profile?.designation || ''} disabled readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input type="text" className="form-control" value={profile?.joining_date || ''} disabled readOnly />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
