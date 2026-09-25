import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const SupplementStore = () => {
  const { user } = useAuth();
  const { addToCart, totalItems, totalDiscountPrice } = useCart();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Order modal for members
  const [orderModalProduct, setOrderModalProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Admin Add/Edit Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'protein',
    brand: '',
    flavor: 'Double Chocolate',
    weight_size: '2 kg (60 Servings)',
    price: 5999,
    discount_price: 4999,
    stock: 15,
    badge: 'Bestseller',
    image_url: '',
    description: ''
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
      if (search) params.append('search', search);

      const res = await axiosClient.get(`/api/products/list.php?${params.toString()}`);
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load supplements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openOrderModal = (product) => {
    setOrderModalProduct(product);
    setOrderQuantity(1);
    setOrderSuccess(null);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!orderModalProduct) return;

    setOrderSubmitting(true);
    try {
      const res = await axiosClient.post('/api/products/order.php', {
        product_id: orderModalProduct.id,
        quantity: orderQuantity
      });
      setOrderSuccess(res.message || 'Order placed successfully!');
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: activeCategory !== 'all' ? activeCategory : 'protein',
      brand: '',
      flavor: 'Rich Chocolate',
      weight_size: '2 kg (60 Servings)',
      price: 5999,
      discount_price: 4799,
      stock: 15,
      badge: 'TOP CHOICE',
      image_url: '',
      description: ''
    });
    setShowAdminModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      flavor: product.flavor,
      weight_size: product.weight_size,
      price: product.price,
      discount_price: product.discount_price,
      stock: product.stock,
      badge: product.badge || 'In Stock',
      image_url: product.image_url || '',
      description: product.description || ''
    });
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminSubmitting(true);
    try {
      if (editingProduct) {
        await axiosClient.post('/api/products/update.php', {
          id: editingProduct.id,
          ...formData
        });
      } else {
        await axiosClient.post('/api/products/create.php', formData);
      }
      setShowAdminModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this supplement?')) return;
    try {
      await axiosClient.post('/api/products/delete.php', { id });
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'protein':
        return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
      case 'creatine':
        return 'bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25';
      case 'bcaa':
        return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case 'preworkout':
        return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary border';
    }
  };

  const resolveProductImage = (url) => {
    if (!url) return `${process.env.PUBLIC_URL || ''}/images/products/on_whey.jpg`;
    if (url.startsWith('/images/')) {
      return (process.env.PUBLIC_URL || '') + url;
    }
    return url;
  };

  return (
    <div className="container-fluid py-3 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-3 p-3 p-md-4 mb-3 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-0.5 mb-1.5 fw-semibold small">
            <i className="bi bi-capsule me-1" style={{ fontSize: '0.78rem' }}></i> Authentic Supplements Store
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Hulk Nutrition & Protein Counter
          </h4>
          <p className="text-secondary small mb-0">
            100% genuine Whey Protein, Creatine Monohydrate, and BCAA stacks at exclusive gym member prices.
          </p>
        </div>

        {isAdmin ? (
          <div>
            <button
              onClick={openAddModal}
              className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-plus-circle" style={{ fontSize: '0.85rem' }}></i>
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <div>
            <Link
              to="/cart"
              className="btn btn-sm btn-outline-light fw-semibold px-3 py-1.5 shadow-sm d-flex align-items-center gap-2"
            >
              <i className="bi bi-cart3"></i>
              <span>View Cart</span>
              {totalItems > 0 && (
                <span className="badge rounded-pill bg-success text-white px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>

      {!isAdmin && totalItems > 0 && (
        <div className="alert alert-success py-2 px-3 mb-3 rounded-3 border-0 bg-success bg-opacity-10 text-success d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center gap-2 small">
            <i className="bi bi-cart-check-fill fs-5"></i>
            <span>
              You have <strong>{totalItems} item(s)</strong> in your cart. Total: <strong>₹{totalDiscountPrice.toLocaleString()}</strong>
            </span>
          </div>
          <Link to="/cart" className="btn btn-sm btn-success fw-bold px-3 py-1">
            Go to Cart →
          </Link>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small shadow-sm mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Tabs */}
          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 fw-semibold ${
                activeCategory === 'all' ? 'btn-success text-white' : 'btn-light text-dark'
              }`}
            >
              <i className="bi bi-grid-fill"></i>
              <span>All Products ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveCategory('protein')}
              className={`btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 fw-semibold ${
                activeCategory === 'protein' ? 'btn-success text-white' : 'btn-light text-dark'
              }`}
            >
              <i className="bi bi-droplet-fill text-primary"></i>
              <span>Whey Protein</span>
            </button>
            <button
              onClick={() => setActiveCategory('creatine')}
              className={`btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 fw-semibold ${
                activeCategory === 'creatine' ? 'btn-success text-white' : 'btn-light text-dark'
              }`}
            >
              <i className="bi bi-lightning-charge-fill text-warning"></i>
              <span>Creatine</span>
            </button>
            <button
              onClick={() => setActiveCategory('bcaa')}
              className={`btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 fw-semibold ${
                activeCategory === 'bcaa' ? 'btn-success text-white' : 'btn-light text-dark'
              }`}
            >
              <i className="bi bi-heart-pulse-fill text-danger"></i>
              <span>BCAA & Aminos</span>
            </button>
            <button
              onClick={() => setActiveCategory('preworkout')}
              className={`btn btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-1 fw-semibold ${
                activeCategory === 'preworkout' ? 'btn-success text-white' : 'btn-light text-dark'
              }`}
            >
              <i className="bi bi-fire text-danger"></i>
              <span>Pre-Workout</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ maxWidth: '320px' }} className="w-100">
            <form onSubmit={handleSearchSubmit} className="input-group">
              <input
                type="text"
                className="form-control rounded-start-3 form-control-sm py-2"
                placeholder="Search brand or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-outline-success rounded-end-3 px-3">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading products...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold">Fetching authentic supplements...</p>
        </div>
      ) : (
        <div className="row g-4">
          {products.length > 0 ? (
            products.map((prod) => {
              const savings = Number(prod.price) - Number(prod.discount_price);
              return (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={prod.id}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 d-flex flex-column justify-content-between position-relative">
                    
                    {/* Top Badges */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className={`badge text-uppercase small px-2 py-1 ${getCategoryBadgeClass(prod.category)}`}>
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small px-2 py-1 fw-bold">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      {/* Product Photo */}
                      <div
                        className="rounded-3 overflow-hidden mb-2.5 bg-light d-flex align-items-center justify-content-center border"
                        style={{ height: '170px' }}
                      >
                        <img
                          src={resolveProductImage(prod.image_url)}
                          alt={prod.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'contain', padding: '8px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${process.env.PUBLIC_URL || ''}/images/products/on_whey.jpg`;
                          }}
                        />
                      </div>

                      <div className="text-secondary small fw-semibold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                        {prod.brand}
                      </div>

                      <h6 className="fw-bold text-dark mb-1" style={{ minHeight: '40px' }}>
                        {prod.name}
                      </h6>

                      <div className="d-flex flex-wrap gap-1 mb-2">
                        <span className="badge bg-light text-dark border small">
                          <i className="bi bi-funnel me-1"></i> {prod.flavor}
                        </span>
                        <span className="badge bg-light text-dark border small">
                          <i className="bi bi-box-seam me-1"></i> {prod.weight_size}
                        </span>
                      </div>

                      <p className="text-muted small mb-3" style={{ fontSize: '0.8rem', minHeight: '48px' }}>
                        {prod.description}
                      </p>
                    </div>

                    {/* Pricing & Order CTA */}
                    <div className="pt-2 border-top">
                      <div className="d-flex align-items-baseline gap-2 mb-1">
                        <span className="fs-5 fw-bold text-success">
                          ₹{Number(prod.discount_price).toLocaleString()}
                        </span>
                        <span className="text-muted text-decoration-line-through small">
                          ₹{Number(prod.price).toLocaleString()}
                        </span>
                        {savings > 0 && (
                          <span className="badge bg-success bg-opacity-10 text-success small">
                            Save ₹{savings.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-muted">
                          Stock: <strong className="text-dark">{prod.stock} units</strong>
                        </span>
                        <span className="badge bg-success bg-opacity-10 text-success small">
                          100% Genuine
                        </span>
                      </div>

                      {isAdmin ? (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="btn btn-sm btn-outline-primary flex-fill py-1 d-flex align-items-center justify-content-center gap-1"
                          >
                            <i className="bi bi-pencil-fill"></i>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center justify-content-center"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(prod, 1)}
                            className="btn btn-sm btn-outline-success flex-fill py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                            title="Add to cart"
                          >
                            <i className="bi bi-cart-plus-fill"></i>
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openOrderModal(prod)}
                            className="btn btn-sm btn-success px-2.5 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                            title="Quick Reserve at Desk"
                          >
                            <i className="bi bi-lightning-fill"></i>
                            <span>Reserve</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-bag-x fs-1 d-block mb-2"></i>
              No supplements found in this category.
            </div>
          )}
        </div>
      )}

      {/* Member Order Inquire Modal */}
      {orderModalProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-bag-check-fill text-success"></i>
                  <span>Front Desk Order Inquire</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOrderModalProduct(null)}
                ></button>
              </div>

              {orderSuccess ? (
                <div className="modal-body text-center py-4">
                  <i className="bi bi-check-circle text-success fs-1 mb-3 d-inline-block"></i>
                  <h5 className="fw-bold text-dark mb-1">Reservation Received!</h5>
                  <p className="text-secondary small mb-3">
                    Your request for <strong>{orderQuantity}x {orderModalProduct.name}</strong> has been forwarded to the gym reception.
                  </p>
                  <div className="bg-light p-3 rounded-3 border mb-3 small">
                    Total Payable at Desk:{' '}
                    <strong className="text-success fs-6">
                      ₹{(Number(orderModalProduct.discount_price) * orderQuantity).toLocaleString()}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-success rounded-3 px-4"
                    onClick={() => setOrderModalProduct(null)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmOrder}>
                  <div className="modal-body">
                    <div className="d-flex gap-3 align-items-center bg-light p-3 rounded-3 border mb-3">
                      <div className="rounded-3 overflow-hidden bg-white border flex-shrink-0" style={{ width: '64px', height: '64px' }}>
                        <img
                          src={resolveProductImage(orderModalProduct.image_url)}
                          alt={orderModalProduct.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'contain', padding: '4px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${process.env.PUBLIC_URL || ''}/images/products/on_whey.jpg`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>{orderModalProduct.brand}</div>
                        <h6 className="fw-bold text-dark mb-0.5">{orderModalProduct.name}</h6>
                        <div className="small text-secondary mb-1">
                          {orderModalProduct.flavor} | {orderModalProduct.weight_size}
                        </div>
                        <div className="fw-bold text-success">
                          ₹{Number(orderModalProduct.discount_price).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Quantity</label>
                      <div className="input-group" style={{ maxWidth: '180px' }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={orderModalProduct.stock}
                          className="form-control text-center"
                          value={orderQuantity}
                          onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setOrderQuantity(Math.min(orderModalProduct.stock, orderQuantity + 1))}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border">
                      <span className="fw-semibold text-dark">Total Amount:</span>
                      <span className="fw-bold text-success fs-5">
                        ₹{(Number(orderModalProduct.discount_price) * orderQuantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button
                      type="button"
                      className="btn btn-light rounded-3"
                      onClick={() => setOrderModalProduct(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success rounded-3 px-4 fw-bold"
                      disabled={orderSubmitting}
                    >
                      {orderSubmitting ? 'Reserving...' : 'Confirm Reservation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {showAdminModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? 'Edit Product' : 'Add Supplement Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAdminModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAdminSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Product Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Optimum Nutrition Gold Standard 100% Whey"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Photo Image URL (Supplement Jar / Bottle)</label>
                    <input
                      type="url"
                      className="form-control rounded-3"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Image URL or local image path"
                    />
                    {formData.image_url && (
                      <div className="mt-2 rounded-3 overflow-hidden border bg-light d-flex align-items-center justify-content-center" style={{ height: '110px' }}>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-100 h-100"
                          style={{ objectFit: 'contain', padding: '6px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select rounded-3"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="protein">Whey Protein</option>
                        <option value="creatine">Creatine</option>
                        <option value="bcaa">BCAA & Aminos</option>
                        <option value="preworkout">Pre-Workout</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Brand</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g. Optimum Nutrition"
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Flavor</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={formData.flavor}
                        onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                        placeholder="e.g. Double Rich Chocolate"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Weight / Servings</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        required
                        value={formData.weight_size}
                        onChange={(e) => setFormData({ ...formData, weight_size: e.target.value })}
                        placeholder="e.g. 2 kg / 74 Servings"
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold">MRP (₹)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Gym Price (₹)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        required
                        value={formData.discount_price}
                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Stock Qty</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control rounded-3"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Badge Tag</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g. BESTSELLER or 100% PURE"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Key benefits, protein content per scoop, etc."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-3"
                    onClick={() => setShowAdminModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-3 px-4 fw-bold"
                    disabled={adminSubmitting}
                  >
                    {adminSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Shop'}
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

export default SupplementStore;
