import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient.get('/api/dashboard/stats.php')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard metrics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading metrics...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4 shadow-sm" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-0.5 mb-1.5 fw-semibold small">
            <i className="bi bi-shield-check me-1" style={{ fontSize: '0.78rem' }}></i> Hulk Fitness • Admin Control Center
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Hulk Fitness Dashboard
          </h4>
          <p className="text-secondary small mb-0">Overview of gym memberships, machines, supplements, offers, and revenue</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/equipment" className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5">
            <i className="bi bi-buildings" style={{ fontSize: '0.85rem' }}></i>
            <span>Equipment & Rooms</span>
          </Link>
          <Link to="/supplements" className="btn btn-sm btn-outline-light fw-semibold px-2.5 py-1.5 d-flex align-items-center gap-1.5">
            <i className="bi bi-bag" style={{ fontSize: '0.85rem' }}></i>
            <span>Nutrition Shop</span>
          </Link>
          <Link to="/plans?tab=offers" className="btn btn-sm btn-outline-light fw-semibold px-2.5 py-1.5 d-flex align-items-center gap-1.5">
            <i className="bi bi-tag" style={{ fontSize: '0.85rem' }}></i>
            <span>Plans & Offers</span>
          </Link>
        </div>
      </div>

      {/* 5 Core KPI Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Total Members */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Members</span>
              <i className="bi bi-people text-secondary fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1">{stats?.total_members || 0}</h3>
            <span className="text-muted small">Registered athletes</span>
          </div>
        </div>

        {/* Active Members */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Active Members</span>
              <i className="bi bi-check-circle text-success fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-success">{stats?.active_members || 0}</h3>
            <span className="text-muted small">Current active passes</span>
          </div>
        </div>

        {/* Expired Members */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Expired Members</span>
              <i className="bi bi-exclamation-circle text-danger fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-danger">{stats?.expired_members || 0}</h3>
            <span className="text-muted small">Renewal required</span>
          </div>
        </div>

        {/* Total Plans */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Active Plans</span>
              <i className="bi bi-tags text-info fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1">{stats?.total_plans || 0}</h3>
            <span className="text-muted small">Packages configured</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-xl">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Revenue</span>
              <i className="bi bi-currency-rupee text-warning fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-dark">₹{Number(stats?.total_revenue || 0).toLocaleString()}</h3>
            <span className="text-muted small">Subscription fees</span>
          </div>
        </div>
      </div>

      {/* 3 Quick Module Cards: Equipment, Supplements, Offers */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <i className="bi bi-cpu text-success fs-5"></i>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                  100% Operational
                </span>
              </div>
              <h5 className="fw-bold text-dark mb-1">Equipment & Workout Rooms</h5>
              <p className="text-secondary small mb-3">
                Full inventory across 5 training zones (Cardio, Free Weights, Machine Arena, CrossFit Turf, Yoga Deck).
              </p>
            </div>
            <Link to="/equipment" className="btn btn-sm btn-outline-success w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1">
              <span>Manage Equipment & Rooms</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <i className="bi bi-bag text-info fs-5"></i>
                <span className="badge bg-info bg-opacity-10 text-dark border border-info border-opacity-25 px-2 py-1">
                  Top Supplements
                </span>
              </div>
              <h5 className="fw-bold text-dark mb-1">Hulk Nutrition Store</h5>
              <p className="text-secondary small mb-3">
                Whey Protein, Micronized Creatine, BCAA & Pre-workout products with stock and member pricing.
              </p>
            </div>
            <Link to="/supplements" className="btn btn-sm btn-outline-info w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1">
              <span>Manage Nutrition Shop</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <i className="bi bi-tag text-warning fs-5"></i>
                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2 py-1">
                  Promotions
                </span>
              </div>
              <h5 className="fw-bold text-dark mb-1">Gym Offers & Discounts</h5>
              <p className="text-secondary small mb-3">
                Festival passes, student vouchers, and renewal coupon codes for gym members.
              </p>
            </div>
            <Link to="/plans?tab=offers" className="btn btn-sm btn-outline-warning w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1">
              <span>Manage Plans & Offers</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Memberships / Payments Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Recent Memberships & Admissions</h5>
            <p className="text-muted small mb-0">Latest member plan assignments and payment records</p>
          </div>
          <Link to="/memberships" className="btn btn-sm btn-outline-success">
            View All Memberships <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary text-uppercase">
                <th>#</th>
                <th>Member</th>
                <th>Plan Name</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Duration Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_memberships && stats.recent_memberships.length > 0 ? (
                stats.recent_memberships.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold text-secondary">#{item.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{item.member_name}</div>
                      <div className="small text-muted">{item.member_email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">
                        {item.plan_name}
                      </span>
                    </td>
                    <td className="fw-bold text-success">₹{Number(item.amount).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-uppercase text-secondary px-2 py-1">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {item.start_date} <span className="text-secondary">to</span> {item.end_date}
                    </td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No memberships recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
