import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient.get('/api/members/my_profile.php')
      .then((res) => {
        setProfileData(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load member profile');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading member portal...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Loading Member Portal...</p>
      </div>
    );
  }

  const member = profileData?.member || user;
  const membership = profileData?.membership;

  return (
    <div className="container-fluid py-3 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-2.5">
          <i className="bi bi-person-circle text-success fs-3 d-none d-sm-inline-block"></i>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-0.5 small">
                MEMBER PORTAL
              </span>
              <span className="badge bg-light text-dark small">ID #{member?.id}</span>
            </div>
            <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, <span className="text-success">{member?.name}</span>!
            </h4>
            <p className="text-secondary mb-0 small">
              View your active gym plan, check equipment in workout rooms, claim offers, and explore supplements.
            </p>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/plans" className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-inline-flex align-items-center gap-1.5">
            <i className="bi bi-tags" style={{ fontSize: '0.85rem' }}></i>
            <span>Plans & Offers</span>
          </Link>
          <Link to="/equipment" className="btn btn-sm btn-outline-light fw-semibold px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5">
            <i className="bi bi-cpu" style={{ fontSize: '0.85rem' }}></i>
            <span>Gym Equipment</span>
          </Link>
          <Link to="/supplements" className="btn btn-sm btn-outline-light fw-semibold px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5">
            <i className="bi bi-capsule" style={{ fontSize: '0.85rem' }}></i>
            <span>Supplements</span>
          </Link>
          <Link to="/cart" className="btn btn-sm btn-outline-light fw-semibold px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 position-relative">
            <i className="bi bi-cart3" style={{ fontSize: '0.85rem' }}></i>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="badge rounded-pill bg-success text-white px-1.5 py-0.5 ms-1" style={{ fontSize: '0.65rem' }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 small mb-4 shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Membership Card + 3 Core Quick Stat Tiles */}
      <div className="row g-4 mb-4">
        {/* Active Membership Status Card */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small fw-bold text-uppercase d-flex align-items-center gap-1">
                <i className="bi bi-credit-card text-success"></i>
                <span>My Active Plan</span>
              </span>
              {membership?.current_status === 'Active' ? (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill small">
                  <i className="bi bi-check-circle me-1"></i> Active
                </span>
              ) : (
                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-1 rounded-pill small">
                  Renewal Due
                </span>
              )}
            </div>

            {membership ? (
              <div>
                <h4 className="fw-bold text-dark mb-1">{membership.plan_name}</h4>
                <p className="text-muted small mb-3">
                  Duration: <strong className="text-dark">{membership.duration} Days</strong>
                </p>

                <div className="bg-light rounded-3 p-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Start Date:</span>
                    <strong className="text-dark small">{membership.start_date}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Valid Until:</span>
                    <strong className="text-dark small">{membership.end_date}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Amount Paid:</span>
                    <strong className="text-success small">₹{Number(membership.amount).toLocaleString()}</strong>
                  </div>
                  <hr className="my-2 opacity-25" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small fw-semibold">Days Remaining:</span>
                    <span className="badge bg-success text-white px-2 py-1">
                      {Math.max(0, membership.days_remaining)} Days Left
                    </span>
                  </div>
                </div>

                <Link to="/plans?tab=offers" className="btn btn-sm btn-outline-success w-100 py-2 d-flex align-items-center justify-content-center gap-1">
                  <i className="bi bi-tag"></i>
                  <span>Check Renewal Offers</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-info-circle text-warning fs-2 mb-2 d-inline-block"></i>
                <h6 className="fw-bold text-dark">No Active Plan</h6>
                <p className="text-muted small">Please contact the front desk or explore our membership offers.</p>
                <Link to="/plans" className="btn btn-sm btn-success px-3">
                  View Plans & Offers
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3 Core Quick Stat Tiles */}
        <div className="col-12 col-lg-7">
          <div className="row g-3 h-100">
            {/* Total Machines in Gym */}
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-secondary small fw-bold text-uppercase">Equipment</span>
                    <i className="bi bi-cpu text-success fs-5"></i>
                  </div>
                  <h3 className="fw-bold mb-1 text-dark">{profileData?.gym_active_machines || 172} Units</h3>
                  <p className="text-muted small mb-2">Across 5 workout zones</p>
                </div>
                <Link to="/equipment" className="small fw-semibold text-success text-decoration-none">
                  View Rooms <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Active Offers */}
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-secondary small fw-bold text-uppercase">Offers</span>
                    <i className="bi bi-tag text-warning fs-5"></i>
                  </div>
                  <h3 className="fw-bold mb-1 text-dark">{profileData?.total_active_offers || 5} Active</h3>
                  <p className="text-muted small mb-2">Discounts & promo codes</p>
                </div>
                <Link to="/plans?tab=offers" className="small fw-semibold text-warning text-decoration-none">
                  Claim Deals <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Supplements Shop */}
            <div className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-secondary small fw-bold text-uppercase">Supplements</span>
                    <i className="bi bi-capsule text-info fs-5"></i>
                  </div>
                  <h3 className="fw-bold mb-1 text-dark">Nutrition</h3>
                  <p className="text-muted small mb-2">Whey, Creatine & BCAA</p>
                </div>
                <Link to="/supplements" className="small fw-semibold text-info text-decoration-none">
                  Shop Store <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-3 mb-2">
              <i className="bi bi-cpu text-success fs-4"></i>
              <div>
                <h6 className="fw-bold text-dark mb-0">Gym Floor & Machines</h6>
                <small className="text-muted">Explore equipment across 5 rooms</small>
              </div>
            </div>
            <p className="text-secondary small mb-3">
              Check all cardio, free weights, cable systems, and CrossFit turf machines.
            </p>
            <Link to="/equipment" className="btn btn-sm btn-outline-success w-100 py-2">
              Explore Equipment
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-3 mb-2">
              <i className="bi bi-capsule text-info fs-4"></i>
              <div>
                <h6 className="fw-bold text-dark mb-0">Protein & Creatine Store</h6>
                <small className="text-muted">Order supplements at front desk</small>
              </div>
            </div>
            <p className="text-secondary small mb-3">
              Whey Protein, Micronized Creatine, and BCAA stacks at discounted member rates.
            </p>
            <Link to="/supplements" className="btn btn-sm btn-outline-info w-100 py-2">
              View Nutrition Store
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-3 mb-2">
              <i className="bi bi-tag text-warning fs-4"></i>
              <div>
                <h6 className="fw-bold text-dark mb-0">Special Member Offers</h6>
                <small className="text-muted">Save on renewals & services</small>
              </div>
            </div>
            <p className="text-secondary small mb-3">
              Claim promo codes for 15% to 30% discounts on memberships and packages.
            </p>
            <Link to="/plans?tab=offers" className="btn btn-sm btn-outline-warning w-100 py-2">
              View Plans & Offers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
