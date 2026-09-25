import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const EquipmentList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [equipment, setEquipment] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Admin Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    room_name: 'Room 1: Cardio Zone',
    category: 'Cardio',
    quantity: 2,
    condition_status: 'Working',
    target_muscle: 'Full Body',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedRoom) params.append('room_name', selectedRoom);
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const res = await axiosClient.get(`/api/equipment/list.php?${params.toString()}`);
      if (res.data) {
        setEquipment(res.data.equipment || []);
        setRooms(res.data.rooms || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      room_name: selectedRoom || (rooms[0]?.room_name || 'Room 1: Cardio Zone'),
      category: 'Strength Machines',
      quantity: 2,
      condition_status: 'Working',
      target_muscle: 'Full Body',
      image_url: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      room_name: item.room_name,
      category: item.category,
      quantity: item.quantity,
      condition_status: item.condition_status,
      target_muscle: item.target_muscle,
      image_url: item.image_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await axiosClient.post('/api/equipment/update.php', {
          id: editingItem.id,
          ...formData
        });
      } else {
        await axiosClient.post('/api/equipment/create.php', formData);
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this equipment?')) return;
    try {
      await axiosClient.post('/api/equipment/delete.php', { id });
      fetchEquipment();
    } catch (err) {
      alert(err.message || 'Failed to delete equipment');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Cardio':
        return 'bi-heart-pulse-fill text-danger';
      case 'Free Weights':
        return 'bi-trophy-fill text-warning';
      case 'Strength Machines':
        return 'bi-cpu-fill text-primary';
      case 'CrossFit & Functional':
        return 'bi-lightning-charge-fill text-warning';
      case 'Recovery':
        return 'bi-activity text-success';
      default:
        return 'bi-gear-fill text-secondary';
    }
  };

  const resolveEquipmentImage = (url) => {
    if (!url) return `${process.env.PUBLIC_URL || ''}/images/equipment/bench.jpg`;
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
            <i className="bi bi-buildings me-1" style={{ fontSize: '0.78rem' }}></i> Gym Facilities & Equipment
          </span>
          <h4 className="fw-bold mb-1 text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Gym Equipment & Room Inventory
          </h4>
          <p className="text-secondary small mb-0">
            Explore full machine counts, condition status, and room-by-room floor allocations.
          </p>
        </div>

        {isAdmin && (
          <div>
            <button
              onClick={openAddModal}
              className="btn btn-sm btn-success fw-semibold px-2.5 py-1.5 shadow-sm d-flex align-items-center gap-1.5"
            >
              <i className="bi bi-plus-circle" style={{ fontSize: '0.85rem' }}></i>
              <span>Add Equipment</span>
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

      {/* 4 KPI Metric Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Machines</span>
              <i className="bi bi-cpu text-success fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{summary?.total_units || 0} Units</h3>
            <span className="text-muted small">{summary?.total_types || 0} equipment types</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Working Units</span>
              <i className="bi bi-check-circle text-success fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-success">{summary?.working_units || 0} Ready</h3>
            <span className="text-muted small">100% operational condition</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Workout Rooms</span>
              <i className="bi bi-door-open text-primary fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{rooms.length || 5} Dedicated Zones</h3>
            <span className="text-muted small">Multi-floor training areas</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Floor Coverage</span>
              <i className="bi bi-layers text-warning fs-5"></i>
            </div>
            <h3 className="fw-bold mb-1 text-dark">Ground & 1st Floor</h3>
            <span className="text-muted small">Plus Rooftop Deck Studio</span>
          </div>
        </div>
      </div>

      {/* Room Breakdown Cards (Click to filter) */}
      <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-buildings text-success"></i>
        <span>Room-Wise Machine Counts</span>
      </h5>
      <div className="row g-3 mb-4">
        {rooms.map((room) => {
          const isSelected = selectedRoom === room.room_name;
          return (
            <div className="col-12 col-md-6 col-xl" key={room.id}>
              <div
                onClick={() => setSelectedRoom(isSelected ? '' : room.room_name)}
                style={{ cursor: 'pointer' }}
                className={`card border rounded-4 p-3 h-100 transition-all ${
                  isSelected ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-light-subtle bg-white'
                }`}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-dark text-white small px-2 py-1">{room.floor}</span>
                  <span className="badge bg-success text-white fw-bold">
                    {room.total_machines} Machines
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-1">{room.room_name}</h6>
                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                  {room.description}
                </p>
                {isSelected && (
                  <div className="small text-success fw-semibold mt-2">
                    <i className="bi bi-check2-circle me-1"></i> Filter Active
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <form onSubmit={handleSearchSubmit} className="input-group">
              <input
                type="text"
                className="form-control rounded-start-3"
                placeholder="Search machine or muscle target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-success rounded-end-3 px-3">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-3"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">All Workout Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.room_name}>
                  {r.room_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-3"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Cardio">Cardio</option>
              <option value="Free Weights">Free Weights</option>
              <option value="Strength Machines">Strength Machines</option>
              <option value="CrossFit & Functional">CrossFit & Functional</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-end">
            {(selectedRoom || selectedCategory || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRoom('');
                  setSelectedCategory('');
                  setSearch('');
                }}
                className="btn btn-sm btn-outline-secondary w-100"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Directory */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
          <div>
            <h5 className="fw-bold mb-1">Equipment Directory</h5>
            <p className="text-muted small mb-0">Showing {equipment.length} equipment configurations</p>
          </div>

          <div className="btn-group btn-group-sm bg-light p-1 rounded-3 border" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-2 fw-semibold px-2.5 py-1 ${
                viewMode === 'grid' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <i className="bi bi-grid me-1"></i> Visual Cards
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-2 fw-semibold px-2.5 py-1 ${
                viewMode === 'table' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'
              }`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-table me-1"></i> Table View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted small">Loading equipment items...</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Visual Cards Grid View */
          equipment.length > 0 ? (
            <div className="row g-3 g-md-4">
              {equipment.map((item) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={item.id}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white overflow-hidden d-flex flex-column justify-content-between transition-all">
                    {/* Machine Photo Header */}
                    <div className="position-relative overflow-hidden bg-dark" style={{ height: '175px' }}>
                      <img
                        src={resolveEquipmentImage(item.image_url)}
                        alt={item.name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.PUBLIC_URL || ''}/images/equipment/bench.jpg`;
                        }}
                      />
                      {/* Condition Badge */}
                      <div className="position-absolute top-0 start-0 m-2">
                        <span
                          className={`badge ${
                            item.condition_status === 'Working'
                              ? 'bg-success text-white'
                              : 'bg-warning text-dark'
                          } px-2 py-1 rounded-pill small shadow-sm fw-semibold`}
                        >
                          <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.45rem' }}></i>
                          {item.condition_status}
                        </span>
                      </div>

                      {/* Quantity Badge */}
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark bg-opacity-80 text-white border border-secondary border-opacity-50 px-2 py-1 rounded-pill small shadow-sm fw-bold">
                          {item.quantity} Units
                        </span>
                      </div>

                      {/* Room Location Overlay */}
                      <div
                        className="position-absolute bottom-0 start-0 w-100 px-2.5 py-1.5"
                        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0) 100%)' }}
                      >
                        <span className="badge bg-black bg-opacity-60 text-light border border-secondary border-opacity-50 small" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          {item.room_name}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <span className="badge bg-light text-secondary border px-2 py-0.5 small" style={{ fontSize: '0.72rem' }}>
                            <i className={`bi ${getCategoryIcon(item.category)} me-1`}></i>
                            {item.category}
                          </span>
                        </div>

                        <h6 className="fw-bold text-dark mb-1.5" style={{ minHeight: '40px', lineHeight: '1.35' }}>
                          {item.name}
                        </h6>

                        <div className="small text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-bullseye text-danger me-1"></i>
                          Target: <span className="fw-semibold text-dark">{item.target_muscle}</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 border-top d-flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn btn-sm btn-outline-primary flex-fill py-1 d-flex align-items-center justify-content-center gap-1"
                          >
                            <i className="bi bi-pencil-fill" style={{ fontSize: '0.78rem' }}></i>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2.5 d-flex align-items-center justify-content-center"
                            title="Delete Equipment"
                          >
                            <i className="bi bi-trash-fill" style={{ fontSize: '0.78rem' }}></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search fs-1 d-block mb-2"></i>
              No equipment matches your current filter.
            </div>
          )
        ) : (
          /* Table View */
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-secondary text-uppercase">
                  <th>Machine / Equipment</th>
                  <th>Category</th>
                  <th>Room Location</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Target Muscle</th>
                  {isAdmin && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {equipment.length > 0 ? (
                  equipment.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="rounded-3 overflow-hidden bg-dark flex-shrink-0 border" style={{ width: '46px', height: '46px' }}>
                            <img
                              src={resolveEquipmentImage(item.image_url)}
                              alt={item.name}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${process.env.PUBLIC_URL || ''}/images/equipment/bench.jpg`;
                              }}
                            />
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{item.name}</div>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              <i className={`bi ${getCategoryIcon(item.category)} me-1`}></i>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark small">{item.room_name}</span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fw-bold fs-6">
                          {item.quantity} Units
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.condition_status === 'Working'
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-warning bg-opacity-10 text-dark'
                          } px-2 py-1 rounded-pill small`}
                        >
                          <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                          {item.condition_status}
                        </span>
                      </td>
                      <td className="small text-muted">{item.target_muscle}</td>
                      {isAdmin && (
                        <td className="text-end">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn btn-sm btn-outline-primary me-2 py-1 px-2"
                            title="Edit Equipment"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Delete Equipment"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-4 text-muted">
                      No equipment matches your current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingItem ? 'Edit Equipment' : 'Add New Gym Equipment'}
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
                    <label className="form-label small fw-semibold">Equipment Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Olympic Squat Rack"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Photo Image URL</label>
                    <input
                      type="url"
                      className="form-control rounded-3"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Image URL or local image path"
                    />
                    {formData.image_url && (
                      <div className="mt-2 rounded-3 overflow-hidden border bg-dark" style={{ height: '110px' }}>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Room Location</label>
                      <select
                        className="form-select rounded-3"
                        required
                        value={formData.room_name}
                        onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                      >
                        {rooms.map((r) => (
                          <option key={r.id} value={r.room_name}>
                            {r.room_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select rounded-3"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Cardio">Cardio</option>
                        <option value="Free Weights">Free Weights</option>
                        <option value="Strength Machines">Strength Machines</option>
                        <option value="CrossFit & Functional">CrossFit & Functional</option>
                        <option value="Recovery">Recovery</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Quantity Count</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control rounded-3"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Condition Status</label>
                      <select
                        className="form-select rounded-3"
                        value={formData.condition_status}
                        onChange={(e) => setFormData({ ...formData, condition_status: e.target.value })}
                      >
                        <option value="Working">Working (100%)</option>
                        <option value="Maintenance">Under Maintenance</option>
                        <option value="Needs Inspection">Needs Inspection</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Muscle Group</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={formData.target_muscle}
                      onChange={(e) => setFormData({ ...formData, target_muscle: e.target.value })}
                      placeholder="e.g. Quadriceps, Glutes, Hamstrings"
                    />
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
                    {submitting ? 'Saving...' : editingItem ? 'Update Equipment' : 'Add to Room'}
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

export default EquipmentList;
