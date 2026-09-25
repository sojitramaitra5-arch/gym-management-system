import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const OffersList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State for Admin Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount_percent: 15,
    description: '',
    valid_until: '',
    badge: 'HOT DEAL',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/api/offers/list.php');
      setOffers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const openAddModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      code: '',
      discount_percent: 15,
      description: '',
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      badge: 'HOT DEAL',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      code: offer.code,
      discount_percent: offer.discount_percent,
      description: offer.description,
      valid_until: offer.valid_until,
      badge: offer.badge || 'HOT DEAL',
      status: offer.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOffer) {
        await axiosClient.post('/api/offers/update.php', {
          id: editingOffer.id,
          ...formData
        });
      } else {
        await axiosClient.post('/api/offers/create.php', formData);
      }
      setShowModal(false);
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axiosClient.post('/api/offers/delete.php', { id });
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="container-fluid py-3 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-0.5 mb-1.5 fw-semibold small">
            <i className="bi bi-gift me-1" style={{ fontSize: '0.78rem' }}></i> Special Gym Deals
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Offers & Promo Discounts
          </h4>
          <p className="text-secondary small mb-0">
            Exclusive membership discounts, student vouchers, and supplement combo deals.
          </p>
        </div>

        {isAdmin && (
          <div>
            <button
              onClick={openAddModal}
              className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-plus-circle" style={{ fontSize: '0.85rem' }}></i>
              <span>Add New Offer</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 small shadow-sm mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading offers...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold">Fetching latest offers...</p>
        </div>
      ) : (
        <div className="row g-4">
          {offers.length > 0 ? (
            offers.map((offer) => (
              <div className="col-12 col-md-6 col-xl-4" key={offer.id}>
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between position-relative">
                  
                  {/* Top Badges */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 fw-bold">
                        <i className="bi bi-fire me-1"></i> {offer.badge}
                      </span>
                      <span className="badge bg-success text-white px-2 py-1 fw-bold">
                        {offer.discount_percent}% OFF
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{offer.title}</h5>
                    <p className="text-secondary small mb-3">{offer.description}</p>
                  </div>

                  {/* Coupon Code & Copy Action */}
                  <div className="pt-2 border-top">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted small">Promo Code:</span>
                      <span className="coupon-box text-dark">
                        {offer.code}
                      </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                      <div className="small text-muted">
                        <i className="bi bi-calendar3 me-1"></i> Valid till: <strong>{offer.valid_until}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(offer.code)}
                        className={`btn btn-sm ${
                          copiedCode === offer.code ? 'btn-success' : 'btn-outline-dark'
                        } d-flex align-items-center gap-1 px-3 py-1`}
                      >
                        {copiedCode === offer.code ? (
                          <>
                            <i className="bi bi-check-circle-fill"></i>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-clipboard"></i>
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="d-flex gap-2 mt-3 pt-2 border-top justify-content-end">
                        <button
                          onClick={() => openEditModal(offer)}
                          className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                        >
                          <i className="bi bi-pencil-fill"></i>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                        >
                          <i className="bi bi-trash-fill"></i>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-percent fs-1 d-block mb-2"></i>
              No active offers at the moment.
            </div>
          )}
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingOffer ? 'Edit Gym Offer' : 'Create New Offer'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Offer Title</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Summer Shred 25% Off"
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Coupon Code</label>
                      <input
                        type="text"
                        className="form-control rounded-3 text-uppercase"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. SUMMER25"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="form-control rounded-3"
                        required
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Badge Label</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g. HOT DEAL"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Valid Until</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        required
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description / Terms</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief details about how members can claim this offer..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-3 px-4 fw-bold"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingOffer ? 'Update Offer' : 'Publish Offer'}
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

export default OffersList;
