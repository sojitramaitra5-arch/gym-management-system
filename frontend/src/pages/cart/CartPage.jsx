import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const resolveProductImage = (url) => {
  if (!url) return `${process.env.PUBLIC_URL || ''}/images/products/on_whey.jpg`;
  if (url.startsWith('/images/')) {
    return (process.env.PUBLIC_URL || '') + url;
  }
  return url;
};

const CartPage = () => {
  const {
    cartItems,
    totalItems,
    totalDiscountPrice,
    totalOriginalPrice,
    totalSavings,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await axiosClient.post('/api/products/order.php', payload);

      setOrderSuccessData({
        message: res.message || 'Order request placed successfully!',
        items: [...cartItems],
        total: totalDiscountPrice,
        count: totalItems
      });

      clearCart();
    } catch (err) {
      setError(err.message || 'Failed to place reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3 animate-fade-in" style={{ maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-0.5 mb-1.5 fw-semibold small">
            <i className="bi bi-cart3 me-1"></i> Member Supplements Cart
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            My Shopping Cart
          </h4>
          <p className="text-secondary small mb-0">
            Review your selected supplements and reserve them for collection at the front desk.
          </p>
        </div>

        <Link
          to="/supplements"
          className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 align-self-start align-self-md-auto"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Continue Shopping</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small shadow-sm mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3">
          <div className="mb-3">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">Your Cart is Currently Empty</h4>
          <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
            You haven't added any supplements to your reservation cart yet. Explore our genuine whey proteins, creatines, and workout stacks.
          </p>
          <div>
            <Link
              to="/supplements"
              className="btn btn-success px-4 py-2 rounded-3 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-capsule"></i>
              <span>Browse Supplements Store</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {/* Items Column */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white border-bottom py-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">
                  Reserved Items ({totalItems})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-2 d-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  <i className="bi bi-trash"></i>
                  <span>Clear Cart</span>
                </button>
              </div>

              <div className="p-3 p-md-4">
                <div className="d-flex flex-column gap-3">
                  {cartItems.map((item) => {
                    const itemSavings = (item.price - item.discount_price) * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-3 border bg-light bg-opacity-50 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
                      >
                        {/* Product Details */}
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 overflow-hidden bg-white border flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{ width: '70px', height: '70px' }}
                          >
                            <img
                              src={resolveProductImage(item.image_url)}
                              alt={item.name}
                              className="w-100 h-100"
                              style={{ objectFit: 'contain', padding: '4px' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${process.env.PUBLIC_URL || ''}/images/products/on_whey.jpg`;
                              }}
                            />
                          </div>

                          <div>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
                              {item.brand}
                            </span>
                            <h6 className="fw-bold text-dark mb-0.5" style={{ fontSize: '0.95rem' }}>
                              {item.name}
                            </h6>
                            <div className="text-secondary small d-flex flex-wrap gap-2 mb-1" style={{ fontSize: '0.78rem' }}>
                              <span><i className="bi bi-funnel me-0.5"></i>{item.flavor}</span>
                              <span>•</span>
                              <span><i className="bi bi-box-seam me-0.5"></i>{item.weight_size}</span>
                            </div>
                            <div className="d-flex align-items-baseline gap-2">
                              <span className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                                ₹{item.discount_price.toLocaleString()}
                              </span>
                              {item.price > item.discount_price && (
                                <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.78rem' }}>
                                  ₹{item.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 pt-2 pt-sm-0 border-top border-top-0-sm">
                          {/* Quantity Selector */}
                          <div className="input-group" style={{ width: '115px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary px-2"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              title="Decrease quantity"
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="form-control form-control-sm text-center fw-bold bg-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary px-2"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              title="Increase quantity"
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-end" style={{ minWidth: '85px' }}>
                            <div className="fw-bold text-dark">
                              ₹{(item.discount_price * item.quantity).toLocaleString()}
                            </div>
                            {itemSavings > 0 && (
                              <div className="text-success small" style={{ fontSize: '0.7rem' }}>
                                Saved ₹{itemSavings.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="btn btn-sm btn-outline-danger p-1 rounded-2"
                            title="Remove from cart"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white sticky-top" style={{ top: '80px' }}>
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-bold text-dark mb-0">Order Summary</h6>
              </div>

              <div className="p-4">
                <div className="d-flex justify-content-between text-secondary mb-2 small">
                  <span>Total Items</span>
                  <span className="fw-semibold text-dark">{totalItems} units</span>
                </div>

                <div className="d-flex justify-content-between text-secondary mb-2 small">
                  <span>Regular Price</span>
                  <span className="text-muted text-decoration-line-through">
                    ₹{totalOriginalPrice.toLocaleString()}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="d-flex justify-content-between text-success mb-2 small">
                    <span className="fw-semibold">Member Discount Savings</span>
                    <span className="fw-bold">- ₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <hr className="my-3 opacity-25" />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark fs-6">Payable at Front Desk</span>
                  <span className="fw-bold text-success fs-5">
                    ₹{totalDiscountPrice.toLocaleString()}
                  </span>
                </div>

                {/* Pickup Instructions Info Box */}
                <div className="p-3 bg-light rounded-3 border mb-3 small">
                  <div className="d-flex gap-2">
                    <i className="bi bi-shop text-success fs-5 flex-shrink-0"></i>
                    <div>
                      <div className="fw-bold text-dark mb-0.5">Collect at Gym Reception</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Your reservation will be kept ready at the reception counter. You can pay via Cash or UPI when collecting.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="btn btn-success w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Reservation...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Confirm Reservation at Desk</span>
                    </>
                  )}
                </button>

                <div className="text-center mt-2.5">
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-shield-check text-success me-1"></i>
                    100% Authentic Gym Sourced Supplements
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Success Modal */}
      {orderSuccessData && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-3">
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <div
                    className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: '70px', height: '70px' }}
                  >
                    <i className="bi bi-check-circle-fill fs-1"></i>
                  </div>
                </div>

                <h4 className="fw-bold text-dark mb-1">Reservation Confirmed!</h4>
                <p className="text-muted small mb-3">
                  Your supplement order has been submitted to the gym reception team.
                </p>

                <div className="bg-light p-3 rounded-3 border mb-3 text-start small">
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-muted">Reserved For:</span>
                    <span className="fw-semibold text-dark">{user?.name || 'Gym Athlete'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1.5">
                    <span className="text-muted">Total Quantity:</span>
                    <span className="fw-semibold text-dark">{orderSuccessData.count} items</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-1.5 mt-1.5">
                    <span className="fw-bold text-dark">Amount to Pay at Desk:</span>
                    <strong className="text-success fs-6">
                      ₹{orderSuccessData.total.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="alert alert-info py-2 px-3 small border-0 bg-info bg-opacity-10 text-info text-start mb-4">
                  <i className="bi bi-info-circle me-1.5"></i>
                  When you visit the gym, mention your name or member ID at the front desk counter to pay and pick up your items.
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3 rounded-3"
                    onClick={() => {
                      setOrderSuccessData(null);
                      navigate('/supplements');
                    }}
                  >
                    Back to Store
                  </button>
                  <button
                    type="button"
                    className="btn btn-success px-4 rounded-3 fw-bold"
                    onClick={() => {
                      setOrderSuccessData(null);
                      navigate('/');
                    }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
