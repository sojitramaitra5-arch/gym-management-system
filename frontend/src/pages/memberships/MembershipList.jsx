import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const MembershipList = () => {
  const [memberships, setMemberships] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'cash'
  });
  const [submitting, setSubmitting] = useState(false);

  // Map of active memberships by member_id
  const activeMembershipsByMemberId = {};
  memberships.forEach((m) => {
    if (m.status === 'Active') {
      activeMembershipsByMemberId[m.member_id] = m;
    }
  });

  const selectedMemberActivePlan = activeMembershipsByMemberId[formData.member_id];
  const selectedMemberObj = members.find((m) => String(m.id) === String(formData.member_id));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, memRes, pRes] = await Promise.all([
        axiosClient.get('/api/memberships/list.php'),
        axiosClient.get('/api/members/list.php'),
        axiosClient.get('/api/plans/list.php')
      ]);
      setMemberships(mRes.data || []);
      setMembers(memRes.data || []);
      setPlans(pRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load membership records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const selectedPlan = plans.find((p) => String(p.id) === String(planId));
    setFormData((prev) => ({
      ...prev,
      plan_id: planId,
      amount: selectedPlan ? selectedPlan.price : ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'member_id') {
      setModalError(null);
    }
  };

  const openAssignModal = () => {
    setModalError(null);
    // Auto-select first member who does NOT already have an active plan
    const firstEligible = members.find((m) => !activeMembershipsByMemberId[m.id]);
    const initialMemberId = firstEligible ? firstEligible.id : (members.length > 0 ? members[0].id : '');

    setFormData({
      member_id: initialMemberId,
      plan_id: plans.length > 0 ? plans[0].id : '',
      start_date: new Date().toISOString().split('T')[0],
      amount: plans.length > 0 ? plans[0].price : '',
      payment_method: 'cash'
    });
    setShowModal(true);
  };

  const handleAssignMembership = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (selectedMemberActivePlan) {
      setModalError(
        `Member '${selectedMemberObj?.name || 'This member'}' already has an active plan ('${selectedMemberActivePlan.plan_name}') valid until ${selectedMemberActivePlan.end_date}. Duplicate plan entry is not allowed.`
      );
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await axiosClient.post('/api/memberships/create.php', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to assign membership');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/api/memberships/delete.php?id=${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid py-4 animate-fade-in">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Memberships & Payments
          </h2>
          <p className="text-secondary small mb-0">Record admission fees, plan enrollments, and payment receipts</p>
        </div>
        <button className="btn btn-success fw-semibold px-4 shadow-sm" onClick={openAssignModal}>
          <i className="bi bi-credit-card me-2"></i> Assign New Membership
        </button>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm" role="alert">
          {error}
        </div>
      )}

      {/* Memberships Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary text-uppercase">
                <th>#ID</th>
                <th>Member</th>
                <th>Enrolled Plan</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading memberships...
                  </td>
                </tr>
              ) : memberships.length > 0 ? (
                memberships.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold text-secondary">#{item.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{item.member_name}</div>
                      <div className="small text-muted">{item.member_email} • {item.member_phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">
                        {item.plan_name} ({item.duration} Days)
                      </span>
                    </td>
                    <td className="fw-bold text-success">₹{Number(item.amount).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-uppercase text-secondary px-2 py-1">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="small text-muted">{item.start_date}</td>
                    <td className="small text-muted">{item.end_date}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Active'
                            ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                            : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                        } px-2 py-1 rounded-pill`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Record"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    No membership records found. Click "Assign New Membership" to enroll an athlete.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Membership Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Assign Membership & Record Payment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAssignMembership}>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Select Member */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">SELECT MEMBER</label>
                    <select
                      className="form-select"
                      name="member_id"
                      value={formData.member_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => {
                        const active = activeMembershipsByMemberId[m.id];
                        return (
                          <option key={m.id} value={m.id}>
                            #{m.id} - {m.name} ({m.email}) {active ? ` • [Active Plan: ${active.plan_name}]` : ' • [Eligible]'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Warning if selected member already has an active plan */}
                  {selectedMemberActivePlan && (
                    <div className="alert alert-warning py-2 small mb-3 d-flex align-items-start gap-2">
                      <i className="bi bi-exclamation-triangle-fill text-warning flex-shrink-0 mt-0.5"></i>
                      <div>
                        <strong>Member already has an active plan!</strong><br />
                        {selectedMemberObj?.name || 'This member'} is currently enrolled in <strong>{selectedMemberActivePlan.plan_name}</strong> valid until <strong>{selectedMemberActivePlan.end_date}</strong>.<br />
                        <span className="text-danger fw-semibold">Duplicate active plan cannot be assigned while this plan is running.</span>
                      </div>
                    </div>
                  )}

                  {/* Select Plan */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">SELECT PLAN</label>
                    <select
                      className="form-select"
                      name="plan_id"
                      value={formData.plan_id}
                      onChange={handlePlanChange}
                      required
                    >
                      <option value="">-- Choose Plan --</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plan_name} ({p.duration} Days) - ₹{Number(p.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    {/* Start Date */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">START DATE</label>
                      <input
                        type="date"
                        className="form-control"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Amount Paid */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">AMOUNT PAID (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="amount"
                        placeholder="₹ Amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">PAYMENT METHOD</label>
                    <div className="d-flex gap-3 mt-1">
                      {['cash', 'card', 'upi'].map((method) => (
                        <div className="form-check" key={method}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="payment_method"
                            id={`method-${method}`}
                            value={method}
                            checked={formData.payment_method === method}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label text-capitalize small" htmlFor={`method-${method}`}>
                            {method}
                          </label>
                        </div>
                      ))}
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
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={submitting || Boolean(selectedMemberActivePlan)}
                  >
                    {submitting ? 'Processing...' : 'Confirm & Assign Plan'}
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

export default MembershipList;
