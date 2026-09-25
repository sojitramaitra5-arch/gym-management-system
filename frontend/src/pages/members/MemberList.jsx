import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State for Add & Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    join_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `/api/members/list.php?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      setMembers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      join_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setIsEditing(true);
    setSelectedId(member.id);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'Male',
      join_date: member.join_date || new Date().toISOString().split('T')[0],
      status: member.status || 'active'
    });
    setShowModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await axiosClient.put(`/api/members/update.php?id=${selectedId}`, formData);
      } else {
        await axiosClient.post('/api/members/create.php', formData);
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Error saving member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await axiosClient.delete(`/api/members/delete.php?id=${id}`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid py-4 animate-fade-in">
      {/* Page Title & Add Button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Gym Members
          </h2>
          <p className="text-secondary small mb-0">Manage athlete records, contact info, and admission details</p>
        </div>
        <button className="btn btn-success fw-semibold px-4 shadow-sm" onClick={openAddModal}>
          <i className="bi bi-person-plus-fill me-2"></i> Add New Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search member by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses (Active & Inactive)</option>
              <option value="active">Active Members Only</option>
              <option value="inactive">Inactive Members Only</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-end text-muted small">
            Total: <strong>{members.length}</strong>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="alert alert-danger shadow-sm" role="alert">
          {error}
        </div>
      )}

      {/* Members Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary text-uppercase">
                <th>#ID</th>
                <th>Name & Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Join Date</th>
                <th>Current Plan</th>
                <th>Membership</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading members...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((m) => (
                  <tr key={m.id}>
                    <td className="fw-bold text-secondary">#{m.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{m.name}</div>
                      <div className="small text-muted">{m.email}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {m.gender || 'Male'}
                      </span>
                    </td>
                    <td className="small text-muted">{m.join_date}</td>
                    <td>
                      {m.plan_name ? (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                          {m.plan_name}
                        </span>
                      ) : (
                        <span className="text-muted small">No Plan</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.membership_status === 'Active'
                            ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                            : m.membership_status === 'Expired'
                            ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                            : 'bg-secondary bg-opacity-10 text-secondary'
                        } px-2 py-1 rounded-pill`}
                      >
                        {m.membership_status || 'No Plan'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="Edit Member"
                          onClick={() => openEditModal(m)}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Member"
                          onClick={() => handleDeleteMember(m.id)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Member Details' : 'Add New Member'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveMember}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">FULL NAME</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. Rohan Shah"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="e.g. rohan@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">PHONE NUMBER</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">GENDER</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">JOIN DATE</label>
                      <input
                        type="date"
                        className="form-control"
                        name="join_date"
                        value={formData.join_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">STATUS</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success px-4" disabled={submitting}>
                    {submitting ? 'Saving...' : isEditing ? 'Update Member' : 'Create Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
