import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const EventList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const memberId = user?.member_id || user?.id;

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enrollTargetEvent, setEnrollTargetEvent] = useState(null);
  const [attendeeTargetEvent, setAttendeeTargetEvent] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    instructor_name: '',
    event_date: '',
    start_time: '07:00',
    end_time: '08:30',
    location: 'Main Fitness Studio',
    max_capacity: 20,
    description: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Enroll Form State
  const [enrollMemberId, setEnrollMemberId] = useState('');
  const [enrollNotes, setEnrollNotes] = useState('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Fetch Events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await axiosClient.get(`/api/events/list.php?${params.toString()}`);
      setEvents(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    // Categories
    axiosClient.get('/api/categories/list.php')
      .then((res) => {
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: res.data[0].id }));
        }
      })
      .catch(() => {});

    // Members (for enrollment dropdown)
    axiosClient.get('/api/members/list.php')
      .then((res) => setMembers(res.data || []))
      .catch(() => {});
  }, []);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  // Create Event Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await axiosClient.post('/api/events/create.php', formData);
      setShowCreateModal(false);
      setSuccessMsg('New gym event scheduled successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setFormData({
        title: '',
        category_id: categories[0]?.id || '',
        instructor_name: '',
        event_date: '',
        start_time: '07:00',
        end_time: '08:30',
        location: 'Main Fitness Studio',
        max_capacity: 20,
        description: ''
      });
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Error creating event');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Cancel Event
  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      await axiosClient.post('/api/events/cancel.php', { id: eventId });
      setSuccessMsg('Event status updated to Cancelled.');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to cancel event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axiosClient.post('/api/events/delete.php', { id: eventId });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Open Attendees Modal
  const handleOpenAttendees = async (eventItem) => {
    setAttendeeTargetEvent(eventItem);
    setAttendeesLoading(true);
    try {
      const res = await axiosClient.get(`/api/registrations/list.php?event_id=${eventItem.id}`);
      setAttendeesList(res.data || []);
    } catch (err) {
      alert(err.message || 'Failed to load attendees');
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleRemoveRegistration = async (registrationId) => {
    try {
      await axiosClient.post('/api/registrations/delete.php', { registration_id: registrationId });
      setAttendeesList((prev) => prev.filter((item) => item.registration_id !== registrationId));
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMemberSelfRegister = async (eventItem) => {
    try {
      await axiosClient.post('/api/registrations/register.php', {
        event_id: eventItem.id,
        member_id: memberId,
        notes: 'Self-registered from Member Portal'
      });
      setSuccessMsg(`Spot successfully booked for ${eventItem.title}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  };

  // Enroll Member Submit
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollMemberId) {
      alert('Please select a member to enroll.');
      return;
    }
    setEnrollSubmitting(true);
    try {
      await axiosClient.post('/api/registrations/register.php', {
        event_id: enrollTargetEvent.id,
        member_id: enrollMemberId,
        notes: enrollNotes
      });
      setEnrollTargetEvent(null);
      setEnrollMemberId('');
      setEnrollNotes('');
      setSuccessMsg(`Member enrolled successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Calculate Metrics
  const totalEvents = events.length;
  const totalRSVPs = events.reduce((acc, curr) => acc + parseInt(curr.current_registered || 0), 0);
  const totalCapacity = events.reduce((acc, curr) => acc + parseInt(curr.max_capacity || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalRSVPs / totalCapacity) * 100) : 0;

  return (
    <div className="container-fluid py-4">
      {/* Header Banner */}
      <div className="bg-dark text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1 mb-2 fw-semibold">
            Hulk Fitness • Member Community Events
          </span>
          <h2 className="fw-bold mb-1 display-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Hulk Fitness Events & Masterclasses
          </h2>
          <p className="text-secondary mb-0">
            Schedule fitness workshops, bootcamps, and manage member participation with capacity control
          </p>
        </div>
        {isAdmin && (
          <div>
            <button 
              className="btn btn-success fw-semibold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-calendar-plus-fill"></i>
              <span>Schedule New Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Events</span>
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                <i className="bi bi-calendar-event-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold mb-1">{totalEvents}</h3>
            <span className="text-muted small">Bootcamps & Clinics</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Member RSVPs</span>
              <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-success">{totalRSVPs}</h3>
            <span className="text-muted small">Registered members</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Seat Fill Rate</span>
              <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                <i className="bi bi-pie-chart-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{occupancyRate}%</h3>
            <span className="text-muted small">Across all active rooms</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Categories</span>
              <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                <i className="bi bi-tags-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold mb-1">{categories.length}</h3>
            <span className="text-muted small">HIIT, Yoga, Powerlifting, Diet</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search events, coaches, studios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-outline-secondary">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="col-12 col-md-7">
            <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                className={`btn btn-sm rounded-pill px-3 ${selectedCategory === '' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`btn btn-sm rounded-pill px-3 ${selectedCategory === String(cat.id) ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory(String(cat.id))}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading events...</span>
          </div>
          <div className="mt-2 text-muted small">Loading Gym Events...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-white">
          <div className="card-body">
            <i className="bi bi-calendar-x text-muted display-4"></i>
            <h5 className="mt-3 text-secondary">No Gym Events Found</h5>
            <p className="text-muted small">Try clearing your filters or click "Schedule New Event" above.</p>
            <button className="btn btn-outline-success btn-sm" onClick={() => { setSelectedCategory(''); setSearch(''); fetchEvents(); }}>
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {events.map((ev) => {
            const currentReg = parseInt(ev.current_registered || 0);
            const maxCap = parseInt(ev.max_capacity || 20);
            const occupancy = Math.round((currentReg / maxCap) * 100);
            const isFull = currentReg >= maxCap;
            const isCancelled = ev.status === 'cancelled';

            return (
              <div key={ev.id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white d-flex flex-column">
                  {/* Card Header */}
                  <div className="card-body pb-0">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-dark border px-3 py-1 rounded-pill">
                        {ev.category_name || 'Fitness'}
                      </span>
                      <span className={`badge rounded-pill px-3 py-1 ${
                        isCancelled ? 'bg-danger' : isFull ? 'bg-warning text-dark' : 'bg-success'
                      }`}>
                        {isCancelled ? 'Cancelled' : isFull ? 'Full House' : 'Open for RSVP'}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{ev.title}</h5>
                    <p className="text-secondary small mb-3" style={{ minHeight: '38px' }}>
                      {ev.description || 'Exclusive fitness masterclass for gym members.'}
                    </p>

                    {/* Metadata Items */}
                    <div className="bg-light rounded-3 p-3 mb-3 small">
                      <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                        <i className="bi bi-person-badge-fill text-success fs-6"></i>
                        <span>Coach: <strong>{ev.instructor_name}</strong></span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 text-dark">
                        <i className="bi bi-calendar3 text-primary fs-6"></i>
                        <span>Date: <strong>{ev.event_date}</strong> ({ev.start_time.substring(0, 5)} - {ev.end_time.substring(0, 5)})</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-dark">
                        <i className="bi bi-geo-alt-fill text-danger fs-6"></i>
                        <span>Location: <strong>{ev.location}</strong></span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-secondary mb-1">
                        <span className="fw-semibold">Capacity</span>
                        <span><strong>{currentReg}</strong> / {maxCap} Seats Enrolled</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar rounded-pill ${
                            isFull ? 'bg-danger' : occupancy >= 75 ? 'bg-warning' : 'bg-success'
                          }`}
                          role="progressbar"
                          style={{ width: `${Math.min(occupancy, 100)}%` }}
                          aria-valuenow={occupancy}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-footer bg-white border-0 pt-2 pb-3 mt-auto">
                    {isAdmin ? (
                      <>
                        <div className="d-flex gap-2 mb-2">
                          <button
                            className="btn btn-success btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                            disabled={isFull || isCancelled}
                            onClick={() => setEnrollTargetEvent(ev)}
                          >
                            <i className="bi bi-person-plus-fill"></i>
                            <span>{isFull ? 'Class Full' : 'Enroll Member'}</span>
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1"
                            onClick={() => handleOpenAttendees(ev)}
                            title="View registered attendees"
                          >
                            <i className="bi bi-people"></i>
                            <span>{currentReg}</span>
                          </button>
                        </div>

                        <div className="d-flex justify-content-end gap-2 border-top pt-2">
                          {!isCancelled && (
                            <button
                              className="btn btn-link text-warning p-0 text-decoration-none small"
                              onClick={() => handleCancelEvent(ev.id)}
                            >
                              Cancel Event
                            </button>
                          )}
                          <button
                            className="btn btn-link text-danger p-0 text-decoration-none small"
                            onClick={() => handleDeleteEvent(ev.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <div>
                        <button
                          className="btn btn-success btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 py-2 shadow-sm"
                          disabled={isFull || isCancelled}
                          onClick={() => handleMemberSelfRegister(ev)}
                        >
                          <i className="bi bi-check-circle-fill"></i>
                          <span>{isFull ? 'Class Full' : 'Book My Spot'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. Modal: Schedule New Event */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">Schedule New Gym Event / Workshop</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary">EVENT TITLE</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Saturday HIIT Bootcamp"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">CATEGORY</label>
                      <select
                        className="form-select"
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.category_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">HEAD COACH / INSTRUCTOR</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Coach Vikram Singh"
                        value={formData.instructor_name}
                        onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">EVENT DATE</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">START TIME</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">END TIME</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">MAX CAPACITY (SEATS)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        className="form-control"
                        required
                        value={formData.max_capacity}
                        onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">LOCATION / STUDIO</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Studio A (Ground Floor)"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">EVENT DESCRIPTION</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Brief overview of the workout or seminar..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-semibold" disabled={formSubmitting}>
                    {formSubmitting ? 'Scheduling...' : 'Schedule Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. Modal: Enroll Member to Event */}
      {/* ========================================================= */}
      {enrollTargetEvent && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">Enroll Member to Event</h5>
                <button type="button" className="btn-close" onClick={() => setEnrollTargetEvent(null)}></button>
              </div>

              <form onSubmit={handleEnrollSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <div className="fw-bold text-dark">{enrollTargetEvent.title}</div>
                    <div className="small text-muted">{enrollTargetEvent.event_date} • {enrollTargetEvent.location}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">SELECT ACTIVE GYM MEMBER</label>
                    <select
                      className="form-select"
                      required
                      value={enrollMemberId}
                      onChange={(e) => setEnrollMemberId(e.target.value)}
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">SPECIAL NOTES (OPTIONAL)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. VIP RSVP, Paid Pass, etc."
                      value={enrollNotes}
                      onChange={(e) => setEnrollNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-secondary" onClick={() => setEnrollTargetEvent(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-semibold" disabled={enrollSubmitting}>
                    {enrollSubmitting ? 'Confirming...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. Modal: View Registered Attendees */}
      {/* ========================================================= */}
      {attendeeTargetEvent && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Enrolled Attendees</h5>
                  <div className="text-muted small">{attendeeTargetEvent.title} ({attendeesList.length} registered)</div>
                </div>
                <button type="button" className="btn-close" onClick={() => setAttendeeTargetEvent(null)}></button>
              </div>

              <div className="modal-body p-0">
                {attendeesLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                    <span className="ms-2 text-muted small">Loading attendees...</span>
                  </div>
                ) : attendeesList.length === 0 ? (
                  <div className="text-center py-5 text-muted small">
                    No members have registered for this event yet.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr className="small text-secondary">
                          <th className="ps-4">MEMBER NAME</th>
                          <th>CONTACT</th>
                          <th>GENDER</th>
                          <th>RSVP DATE</th>
                          <th className="text-end pe-4">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendeesList.map((att) => (
                          <tr key={att.registration_id}>
                            <td className="ps-4">
                              <div className="fw-semibold text-dark">{att.member_name}</div>
                              <div className="small text-muted">{att.member_email}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border font-monospace">
                                {att.member_phone}
                              </span>
                            </td>
                            <td>{att.gender}</td>
                            <td className="small text-muted">{att.registration_date}</td>
                            <td className="text-end pe-4">
                              <button
                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                onClick={() => handleRemoveRegistration(att.registration_id)}
                                title="Remove member from event"
                              >
                                <i className="bi bi-person-dash me-1"></i> Cancel RSVP
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttendeeTargetEvent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
