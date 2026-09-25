import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const PlanList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab = urlTab === 'offers' ? 'offers' : urlTab === 'both' ? 'both' : 'plans';

  // Active Tab: 'plans', 'offers', or 'both'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data States
  const [plans, setPlans] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Member Active Plan & Subscription Modal States
  const [activeMembership, setActiveMembership] = useState(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribingPlan, setSubscribingPlan] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [subscribeSubmitting, setSubscribeSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(null);
  const [subscribeError, setSubscribeError] = useState(null);

  // Plan Add/Edit Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    duration: 30,
    price: 1500
  });
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Offer Add/Edit Modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    title: '',
    code: '',
    discount_percent: 15,
    description: '',
    valid_until: '',
    badge: 'HOT DEAL',
    status: 'active'
  });
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const fetchMemberProfile = async () => {
    if (user?.role === 'member') {
      try {
        const res = await axiosClient.get('/api/members/my_profile.php');
        if (res.data?.membership && res.data.membership.current_status === 'Active') {
          setActiveMembership(res.data.membership);
        } else {
          setActiveMembership(null);
        }
      } catch (err) {
        // Silently handle
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, offersRes] = await Promise.all([
        axiosClient.get('/api/plans/list.php'),
        axiosClient.get('/api/offers/list.php')
      ]);
      setPlans(plansRes.data || []);
      setOffers(offersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load plans and offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMemberProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize active tab with URL changes if search params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'offers') setActiveTab('offers');
    else if (tab === 'both') setActiveTab('both');
    else if (tab === 'plans') setActiveTab('plans');
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'offers') {
      setSearchParams({ tab: 'offers' });
    } else if (tab === 'both') {
      setSearchParams({ tab: 'both' });
    } else {
      setSearchParams({});
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Plan Handlers
  const openAddPlanModal = () => {
    setIsEditingPlan(false);
    setSelectedPlanId(null);
    setPlanFormData({
      plan_name: '',
      duration: 30,
      price: 1500
    });
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan) => {
    setIsEditingPlan(true);
    setSelectedPlanId(plan.id);
    setPlanFormData({
      plan_name: plan.plan_name || '',
      duration: plan.duration || 30,
      price: plan.price || 0
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setPlanSubmitting(true);
    try {
      if (isEditingPlan) {
        await axiosClient.put(`/api/plans/update.php?id=${selectedPlanId}`, planFormData);
      } else {
        await axiosClient.post('/api/plans/create.php', planFormData);
      }
      setShowPlanModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving plan');
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) return;
    try {
      await axiosClient.delete(`/api/plans/delete.php?id=${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  // Offer Handlers
  const openAddOfferModal = () => {
    setEditingOffer(null);
    setOfferFormData({
      title: '',
      code: '',
      discount_percent: 15,
      description: '',
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      badge: 'HOT DEAL',
      status: 'active'
    });
    setShowOfferModal(true);
  };

  const openEditOfferModal = (offer) => {
    setEditingOffer(offer);
    setOfferFormData({
      title: offer.title,
      code: offer.code,
      discount_percent: offer.discount_percent,
      description: offer.description,
      valid_until: offer.valid_until,
      badge: offer.badge || 'HOT DEAL',
      status: offer.status || 'active'
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    setOfferSubmitting(true);
    try {
      if (editingOffer) {
        await axiosClient.post('/api/offers/update.php', {
          id: editingOffer.id,
          ...offerFormData
        });
      } else {
        await axiosClient.post('/api/offers/create.php', offerFormData);
      }
      setShowOfferModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axiosClient.post('/api/offers/delete.php', { id });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  // Member Subscription Handlers
  const openSubscribeModal = (plan) => {
    setSubscribingPlan(plan);
    setCouponInput('');
    setAppliedOffer(null);
    setCouponError(null);
    setStartDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('upi');
    setSubscribeSubmitting(false);
    setSubscribeError(null);
    setSubscribeSuccess(null);
    setShowSubscribeModal(true);
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply !== undefined ? codeToApply : couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      setAppliedOffer(null);
      return;
    }
    const match = offers.find(
      (o) => o.code && o.code.toUpperCase() === code && o.status === 'active'
    );
    if (!match) {
      setCouponError(`Invalid or inactive coupon code '${code}'.`);
      setAppliedOffer(null);
      return;
    }
    if (match.valid_until && new Date(match.valid_until) < new Date(new Date().toDateString())) {
      setCouponError(`Coupon '${match.code}' expired on ${match.valid_until}.`);
      setAppliedOffer(null);
      return;
    }
    setCouponInput(match.code);
    setAppliedOffer(match);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedOffer(null);
    setCouponError(null);
  };

  const basePrice = subscribingPlan ? Number(subscribingPlan.price) : 0;
  const discountPercent = appliedOffer ? Number(appliedOffer.discount_percent) : 0;
  const discountAmount = appliedOffer ? Math.round((basePrice * discountPercent) / 100) : 0;
  const finalAmount = Math.max(0, basePrice - discountAmount);

  const calculateEndDate = () => {
    if (!startDate || !subscribingPlan) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + Number(subscribingPlan.duration));
    return d.toISOString().split('T')[0];
  };

  const handleConfirmSubscribe = async (e) => {
    e.preventDefault();
    if (subscribeSubmitting || !subscribingPlan) return;

    if (activeMembership) {
      setSubscribeError(
        `You currently have an active plan ('${activeMembership.plan_name}') valid until ${activeMembership.end_date}. Duplicate subscription is restricted.`
      );
      return;
    }

    setSubscribeSubmitting(true);
    setSubscribeError(null);

    try {
      const payload = {
        plan_id: subscribingPlan.id,
        start_date: startDate,
        amount: finalAmount,
        payment_method: paymentMethod
      };

      const res = await axiosClient.post('/api/memberships/create.php', payload);

      setSubscribeSuccess({
        message: res.message || 'Membership activated successfully!',
        planName: subscribingPlan.plan_name,
        duration: subscribingPlan.duration,
        startDate: startDate,
        endDate: calculateEndDate(),
        amount: finalAmount,
        paymentMethod: paymentMethod
      });

      fetchData();
      fetchMemberProfile();
    } catch (err) {
      setSubscribeError(err.message || 'Failed to activate membership. Please try again.');
    } finally {
      setSubscribeSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-0.5 mb-1.5 fw-semibold small">
            <i className="bi bi-tags me-1" style={{ fontSize: '0.78rem' }}></i> Plans & Offers Center
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Gym Plans & Promo Offers
          </h4>
          <p className="text-secondary small mb-0">
            Select membership subscription tiers or apply active promotional discount coupons.
          </p>
        </div>

        {isAdmin && (
          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={openAddPlanModal}
              className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-plus-circle" style={{ fontSize: '0.85rem' }}></i>
              <span>Add New Plan</span>
            </button>
            <button
              onClick={openAddOfferModal}
              className="btn btn-sm btn-warning text-dark fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-tag" style={{ fontSize: '0.85rem' }}></i>
              <span>Create Offer</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 small shadow-sm mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Quick Active Coupons Strip */}
      {offers.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark px-2 py-1 small fw-bold">
                <i className="bi bi-ticket-perforated me-1"></i> Active Coupons:
              </span>
              <span className="text-muted small d-none d-lg-inline">
                Click any coupon to copy code:
              </span>
            </div>

            <div className="d-flex flex-wrap gap-1.5 align-items-center">
              {offers.slice(0, 4).map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => handleCopy(offer.code)}
                  className={`btn btn-sm py-1 px-2 rounded-2 border d-flex align-items-center gap-1 text-nowrap ${
                    copiedCode === offer.code
                      ? 'btn-success text-white'
                      : 'btn-light text-dark'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                  title={`Click to copy: ${offer.title}`}
                >
                  <i className={`bi ${copiedCode === offer.code ? 'bi-check-circle-fill' : 'bi-clipboard'}`}></i>
                  <strong>{offer.code}</strong>
                  <span className="badge bg-warning bg-opacity-25 text-dark ms-1">
                    {offer.discount_percent}% OFF
                  </span>
                </button>
              ))}
              {offers.length > 4 && (
                <button
                  type="button"
                  onClick={() => handleTabChange('offers')}
                  className="btn btn-sm btn-link text-decoration-none small text-success p-0 ms-1 fw-semibold"
                  style={{ fontSize: '0.78rem' }}
                >
                  +{offers.length - 4} more
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="btn-group btn-group-sm bg-light p-1 rounded-3 border" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-2 fw-semibold px-3 py-1.5 ${
              activeTab === 'plans' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => handleTabChange('plans')}
          >
            <i className="bi bi-tags me-1.5"></i>
            <span>Membership Plans ({plans.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-2 fw-semibold px-3 py-1.5 ${
              activeTab === 'offers' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => handleTabChange('offers')}
          >
            <i className="bi bi-tag me-1.5"></i>
            <span>Special Offers & Deals ({offers.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-2 fw-semibold px-3 py-1.5 ${
              activeTab === 'both' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => handleTabChange('both')}
          >
            <i className="bi bi-grid me-1.5"></i>
            <span>View All Together</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-2 text-muted small">Loading membership plans and offers...</p>
        </div>
      ) : (
        <>
          {/* Section 1: Membership Plans */}
          {(activeTab === 'plans' || activeTab === 'both') && (
            <div className="mb-4">
              {activeTab === 'both' && (
                <div className="d-flex align-items-center justify-content-between mb-3 pt-2">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-tags-fill text-success me-2"></i>
                    Membership Subscription Plans
                  </h5>
                  <span className="text-muted small">{plans.length} tiers available</span>
                </div>
              )}

              <div className="row g-3 g-md-4">
                {plans.length > 0 ? (
                  plans.map((plan) => {
                    const pricePerMonth = Math.round((Number(plan.price) / Number(plan.duration)) * 30);
                    return (
                      <div className="col-12 col-md-6 col-lg-4" key={plan.id}>
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white d-flex flex-column justify-content-between position-relative transition-all">
                          {/* Top Badges */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 fw-bold">
                                <i className="bi bi-clock me-1"></i> {plan.duration} Days
                              </span>
                              <span className="badge bg-light text-secondary border">
                                Plan #{plan.id}
                              </span>
                            </div>

                            <h5 className="fw-bold text-dark mb-1">{plan.plan_name}</h5>
                            <div className="text-muted small mb-3">
                              Full access to all 5 workout rooms & facilities
                            </div>

                            <div className="my-3 p-3 bg-light rounded-3 border">
                              <div className="d-flex align-items-baseline gap-1">
                                <span className="fs-3 fw-bold text-dark">
                                  ₹{Number(plan.price).toLocaleString()}
                                </span>
                                <span className="text-muted small">/ {plan.duration} days</span>
                              </div>
                              {plan.duration > 30 && (
                                <div className="text-success small fw-semibold mt-1" style={{ fontSize: '0.78rem' }}>
                                  Equates to ~₹{pricePerMonth.toLocaleString()}/month
                                </div>
                              )}
                            </div>

                            {/* Plan Features Checklist */}
                            <ul className="list-unstyled small text-secondary mb-3 space-y-1">
                              <li className="d-flex align-items-center gap-2 mb-1.5">
                                <i className="bi bi-check2-circle text-success fs-6"></i>
                                <span>Cardio, Free Weights & Turf Floor Access</span>
                              </li>
                              <li className="d-flex align-items-center gap-2 mb-1.5">
                                <i className="bi bi-check2-circle text-success fs-6"></i>
                                <span>Locker & Shower Amenities Included</span>
                              </li>
                              <li className="d-flex align-items-center gap-2 mb-1.5">
                                <i className="bi bi-check2-circle text-success fs-6"></i>
                                <span>Certified Fitness Assessment</span>
                              </li>
                              {plan.duration >= 90 && (
                                <li className="d-flex align-items-center gap-2 mb-1.5">
                                  <i className="bi bi-check2-circle text-success fs-6"></i>
                                  <span>Steam & Recovery Deck Pass</span>
                                </li>
                              )}
                            </ul>

                            {/* Best Offer Suggestion Tag */}
                            {offers.length > 0 && (
                              <div className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 w-100 p-2 text-start mb-3 d-flex align-items-center justify-content-between">
                                <span className="small">
                                  <i className="bi bi-tag-fill text-warning me-1"></i>
                                  Use <strong>{offers[0].code}</strong> for {offers[0].discount_percent}% OFF
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(offers[0].code)}
                                  className="btn btn-sm btn-link text-decoration-none p-0 fw-bold text-dark"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {copiedCode === offers[0].code ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-2 border-top">
                            {isAdmin ? (
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => openEditPlanModal(plan)}
                                  className="btn btn-sm btn-outline-primary flex-fill py-1 d-flex align-items-center justify-content-center gap-1"
                                >
                                  <i className="bi bi-pencil-fill" style={{ fontSize: '0.78rem' }}></i>
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePlan(plan.id)}
                                  className="btn btn-sm btn-outline-danger py-1 px-2.5 d-flex align-items-center justify-content-center"
                                  title="Delete Plan"
                                >
                                  <i className="bi bi-trash-fill" style={{ fontSize: '0.78rem' }}></i>
                                </button>
                              </div>
                            ) : (
                              <div>
                                {activeMembership && Number(activeMembership.plan_id) === Number(plan.id) ? (
                                  <div className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1.5 fw-bold">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Active Plan (valid till {activeMembership.end_date})</span>
                                  </div>
                                ) : activeMembership ? (
                                  <button
                                    type="button"
                                    onClick={() => openSubscribeModal(plan)}
                                    className="btn btn-sm btn-outline-secondary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 rounded-3"
                                  >
                                    <i className="bi bi-info-circle"></i>
                                    <span>Plan Details</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openSubscribeModal(plan)}
                                    className="btn btn-sm btn-success text-white w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-1.5 rounded-3 shadow-sm"
                                  >
                                    <i className="bi bi-lightning-charge-fill"></i>
                                    <span>Subscribe Now</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm p-4">
                    No membership plans found. Click "Add New Plan" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Special Offers & Deals */}
          {(activeTab === 'offers' || activeTab === 'both') && (
            <div className="mb-4">
              {activeTab === 'both' && (
                <div className="d-flex align-items-center justify-content-between mb-3 pt-4 border-top">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-tag-fill text-warning me-2"></i>
                    Promotional Deals & Discount Coupons
                  </h5>
                  <span className="text-muted small">{offers.length} active promotions</span>
                </div>
              )}

              <div className="row g-3 g-md-4">
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

                          <h5 className="fw-bold text-dark mb-1.5">{offer.title}</h5>
                          <p className="text-secondary small mb-3">{offer.description}</p>
                        </div>

                        {/* Coupon Box & Copy CTA */}
                        <div className="pt-2 border-top">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-muted small">Coupon Code:</span>
                            <span className="coupon-box text-dark fw-bold px-2 py-0.5 border rounded bg-light">
                              {offer.code}
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between">
                            <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                              <i className="bi bi-calendar3 me-1"></i> Till: <strong>{offer.valid_until}</strong>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(offer.code)}
                              className={`btn btn-sm ${
                                copiedCode === offer.code ? 'btn-success text-white' : 'btn-outline-dark'
                              } d-flex align-items-center gap-1 px-2.5 py-1`}
                              style={{ fontSize: '0.8rem' }}
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
                                onClick={() => openEditOfferModal(offer)}
                                className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                              >
                                <i className="bi bi-pencil-fill" style={{ fontSize: '0.78rem' }}></i>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                              >
                                <i className="bi bi-trash-fill" style={{ fontSize: '0.78rem' }}></i>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm p-4">
                    <i className="bi bi-percent fs-1 d-block mb-2"></i>
                    No active offers at the moment.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Add/Edit Plan Modal */}
      {showPlanModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {isEditingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPlanModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSavePlan}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Plan Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Monthly Standard, Quarterly Pro, Annual Athlete"
                      value={planFormData.plan_name}
                      onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control rounded-3"
                        placeholder="e.g. 30"
                        value={planFormData.duration}
                        onChange={(e) => setPlanFormData({ ...planFormData, duration: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control rounded-3"
                        placeholder="e.g. 1500"
                        value={planFormData.price}
                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-3"
                    onClick={() => setShowPlanModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-3 px-4 fw-bold" disabled={planSubmitting}>
                    {planSubmitting ? 'Saving...' : isEditingPlan ? 'Update Plan' : 'Save Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Offer Modal */}
      {showOfferModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingOffer ? 'Edit Gym Offer' : 'Create New Promotional Offer'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOfferModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveOffer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Offer Title</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      required
                      value={offerFormData.title}
                      onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
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
                        value={offerFormData.code}
                        onChange={(e) => setOfferFormData({ ...offerFormData, code: e.target.value })}
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
                        value={offerFormData.discount_percent}
                        onChange={(e) => setOfferFormData({ ...offerFormData, discount_percent: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Badge Label</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={offerFormData.badge}
                        onChange={(e) => setOfferFormData({ ...offerFormData, badge: e.target.value })}
                        placeholder="e.g. HOT DEAL"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Valid Until</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        required
                        value={offerFormData.valid_until}
                        onChange={(e) => setOfferFormData({ ...offerFormData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description / Terms</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      required
                      value={offerFormData.description}
                      onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                      placeholder="Brief details about how members can claim this offer..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-3"
                    onClick={() => setShowOfferModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-3 px-4 fw-bold"
                    disabled={offerSubmitting}
                  >
                    {offerSubmitting ? 'Saving...' : editingOffer ? 'Update Offer' : 'Publish Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Member Subscribe Modal */}
      {showSubscribeModal && subscribingPlan && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {subscribeSuccess ? (
                /* Celebratory Success View */
                <div className="p-4 p-md-5 text-center bg-white animate-fade-in">
                  <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: '72px', height: '72px' }}>
                    <i className="bi bi-check-circle-fill fs-1"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Membership Activated!</h4>
                  <p className="text-secondary small mb-4">
                    Your gym membership is now live. Welcome to HulkFitness!
                  </p>

                  <div className="bg-light rounded-3 p-3 text-start mb-4 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Plan:</span>
                      <strong className="text-dark small">{subscribeSuccess.planName}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Duration:</span>
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                        {subscribeSuccess.duration} Days
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Valid Period:</span>
                      <span className="text-dark small fw-medium">{subscribeSuccess.startDate} to {subscribeSuccess.endDate}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Amount Paid:</span>
                      <strong className="text-success small">₹{Number(subscribeSuccess.amount).toLocaleString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Payment Mode:</span>
                      <span className="badge bg-secondary text-uppercase small">{subscribeSuccess.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubscribeModal(false);
                        navigate('/');
                      }}
                      className="btn btn-success fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1.5"
                    >
                      <i className="bi bi-speedometer2"></i>
                      <span>Go to My Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubscribeModal(false)}
                      className="btn btn-outline-secondary rounded-3 px-3 py-2"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Subscription Form View */
                <div>
                  <div className="modal-header border-0 pb-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small fw-bold">
                        SELF-ENROLLMENT
                      </span>
                      <h5 className="modal-title fw-bold mb-0 text-dark">
                        Subscribe Plan
                      </h5>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowSubscribeModal(false)}
                    ></button>
                  </div>

                  <form onSubmit={handleConfirmSubscribe}>
                    <div className="modal-body px-3 px-md-4 pt-3 pb-2">
                      {/* Selected Plan Summary Banner */}
                      <div className="bg-dark text-white rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-success text-white px-2 py-0.5 small mb-1">
                            {subscribingPlan.duration} Days
                          </span>
                          <h5 className="fw-bold mb-0 text-white">{subscribingPlan.plan_name}</h5>
                          <small className="text-secondary">Full access to 5 rooms & amenities</small>
                        </div>
                        <div className="text-end">
                          <span className="text-secondary small d-block">Base Price</span>
                          <h4 className="fw-bold text-success mb-0">₹{basePrice.toLocaleString()}</h4>
                        </div>
                      </div>

                      {/* Active Membership Warning Alert */}
                      {activeMembership && (
                        <div className="alert alert-warning py-2.5 px-3 rounded-3 small mb-3 border-0 bg-warning bg-opacity-15 text-dark d-flex gap-2 align-items-start">
                          <i className="bi bi-exclamation-triangle-fill text-warning fs-5 flex-shrink-0 mt-0.5"></i>
                          <div>
                            <strong>Active Plan In Progress:</strong>
                            <p className="mb-0 text-secondary">
                              You currently have an active plan (<strong>{activeMembership.plan_name}</strong>) valid until <strong>{activeMembership.end_date}</strong>. Duplicate active subscriptions are prevented. You can renew once this plan finishes.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error Display */}
                      {subscribeError && (
                        <div className="alert alert-danger py-2 small shadow-sm mb-3 d-flex align-items-center gap-2">
                          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                          <span>{subscribeError}</span>
                        </div>
                      )}

                      {!activeMembership && (
                        <>
                          {/* Start Date */}
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-secondary mb-1">
                              <i className="bi bi-calendar-event me-1 text-success"></i> Membership Start Date
                            </label>
                            <input
                              type="date"
                              className="form-control rounded-3"
                              min={new Date().toISOString().split('T')[0]}
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              required
                            />
                            <div className="form-text small text-muted">
                              Plan will remain active through <strong>{calculateEndDate()}</strong> ({subscribingPlan.duration} days).
                            </div>
                          </div>

                          {/* Promo Coupon / Offer Section */}
                          <div className="mb-3 p-3 bg-light rounded-3 border">
                            <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between mb-1.5">
                              <span>
                                <i className="bi bi-ticket-perforated text-warning me-1"></i> Apply Promo Coupon
                              </span>
                              {appliedOffer && (
                                <button
                                  type="button"
                                  onClick={handleRemoveCoupon}
                                  className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-semibold"
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  Remove Coupon
                                </button>
                              )}
                            </label>

                            {appliedOffer ? (
                              <div className="d-flex align-items-center justify-content-between bg-success bg-opacity-10 border border-success border-opacity-25 rounded-2 p-2">
                                <div className="d-flex align-items-center gap-1.5">
                                  <i className="bi bi-check-circle-fill text-success"></i>
                                  <span className="fw-bold text-dark small">{appliedOffer.code}</span>
                                  <span className="badge bg-success text-white small ms-1">
                                    {appliedOffer.discount_percent}% OFF
                                  </span>
                                </div>
                                <span className="text-success fw-bold small">
                                  -₹{discountAmount.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <div className="input-group input-group-sm mb-2">
                                  <input
                                    type="text"
                                    className="form-control text-uppercase fw-semibold"
                                    placeholder="Enter coupon code (e.g. SUMMER25)"
                                    value={couponInput}
                                    onChange={(e) => {
                                      setCouponInput(e.target.value);
                                      setCouponError(null);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon()}
                                    className="btn btn-dark fw-semibold"
                                  >
                                    Apply
                                  </button>
                                </div>

                                {offers.length > 0 && (
                                  <div className="d-flex flex-wrap gap-1 align-items-center">
                                    <span className="text-muted small me-1" style={{ fontSize: '0.75rem' }}>Available:</span>
                                    {offers.slice(0, 3).map((off) => (
                                      <button
                                        key={off.id}
                                        type="button"
                                        onClick={() => handleApplyCoupon(off.code)}
                                        className="badge bg-warning bg-opacity-25 text-dark border border-warning border-opacity-50 py-1 px-1.5 rounded-2 btn btn-link text-decoration-none"
                                        style={{ fontSize: '0.72rem' }}
                                        title={`Apply ${off.discount_percent}% OFF`}
                                      >
                                        {off.code} ({off.discount_percent}% OFF)
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {couponError && (
                              <div className="text-danger small mt-1.5" style={{ fontSize: '0.78rem' }}>
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {couponError}
                              </div>
                            )}
                          </div>

                          {/* Payment Method Selector */}
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-secondary mb-1.5">
                              <i className="bi bi-credit-card me-1 text-success"></i> Select Payment Method
                            </label>

                            <div className="row g-2">
                              <div className="col-4">
                                <label
                                  className={`card p-2 text-center h-100 rounded-3 border cursor-pointer transition-all ${
                                    paymentMethod === 'upi' ? 'border-success bg-success bg-opacity-10 text-success fw-bold' : 'bg-light text-dark'
                                  }`}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <input
                                    type="radio"
                                    name="subPaymentMethod"
                                    value="upi"
                                    className="d-none"
                                    checked={paymentMethod === 'upi'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                  />
                                  <i className="bi bi-qr-code fs-5 mb-1 d-block"></i>
                                  <span style={{ fontSize: '0.78rem' }}>UPI / QR</span>
                                </label>
                              </div>

                              <div className="col-4">
                                <label
                                  className={`card p-2 text-center h-100 rounded-3 border cursor-pointer transition-all ${
                                    paymentMethod === 'card' ? 'border-success bg-success bg-opacity-10 text-success fw-bold' : 'bg-light text-dark'
                                  }`}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <input
                                    type="radio"
                                    name="subPaymentMethod"
                                    value="card"
                                    className="d-none"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                  />
                                  <i className="bi bi-credit-card-2-front fs-5 mb-1 d-block"></i>
                                  <span style={{ fontSize: '0.78rem' }}>Card</span>
                                </label>
                              </div>

                              <div className="col-4">
                                <label
                                  className={`card p-2 text-center h-100 rounded-3 border cursor-pointer transition-all ${
                                    paymentMethod === 'cash' ? 'border-success bg-success bg-opacity-10 text-success fw-bold' : 'bg-light text-dark'
                                  }`}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <input
                                    type="radio"
                                    name="subPaymentMethod"
                                    value="cash"
                                    className="d-none"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                  />
                                  <i className="bi bi-cash-stack fs-5 mb-1 d-block"></i>
                                  <span style={{ fontSize: '0.78rem' }}>Cash at Desk</span>
                                </label>
                              </div>
                            </div>

                            {paymentMethod === 'upi' && (
                              <div className="bg-light rounded-2 p-2 mt-2 border small text-muted d-flex align-items-center justify-content-between">
                                <span style={{ fontSize: '0.78rem' }}>
                                  <i className="bi bi-shield-lock-fill text-success me-1"></i> UPI ID: <strong>hulkfitness@okhdfcbank</strong>
                                </span>
                                <span className="badge bg-success bg-opacity-25 text-success small">Instant</span>
                              </div>
                            )}
                          </div>

                          {/* Price Breakdown */}
                          <div className="bg-light rounded-3 p-3 border mb-2">
                            <div className="d-flex justify-content-between text-secondary small mb-1">
                              <span>Standard Plan Price:</span>
                              <span>₹{basePrice.toLocaleString()}</span>
                            </div>
                            {appliedOffer && (
                              <div className="d-flex justify-content-between text-success small mb-1 fw-semibold">
                                <span>Promo Discount ({appliedOffer.discount_percent}%):</span>
                                <span>-₹{discountAmount.toLocaleString()}</span>
                              </div>
                            )}
                            <hr className="my-1.5 opacity-25" />
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-dark">Total Payable:</span>
                              <h5 className="fw-bold text-success mb-0">₹{finalAmount.toLocaleString()}</h5>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="modal-footer border-0 pt-0 px-3 px-md-4 pb-3">
                      <button
                        type="button"
                        className="btn btn-light rounded-3"
                        onClick={() => setShowSubscribeModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success rounded-3 px-4 fw-bold shadow-sm"
                        disabled={subscribeSubmitting || !!activeMembership}
                      >
                        {subscribeSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                            <span>Activating...</span>
                          </>
                        ) : activeMembership ? (
                          'Active Plan Running'
                        ) : (
                          <>
                            <i className="bi bi-lightning-charge-fill me-1"></i>
                            <span>Pay & Activate (₹{finalAmount.toLocaleString()})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanList;
