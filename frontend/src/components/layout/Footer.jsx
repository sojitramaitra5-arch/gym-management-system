import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white border-top border-secondary border-opacity-25 mt-auto pt-4 pb-3 overflow-hidden">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        <div className="row g-4 pb-3">
          {/* Brand & Mission Column */}
          <div className="col-12 col-md-4">
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
              <i className="bi bi-lightning-charge-fill text-warning fs-4"></i>
              <span className="text-white fs-5 fw-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Hulk<span className="text-warning">Fitness</span>
              </span>
            </Link>
            <p className="text-secondary small mb-0" style={{ maxWidth: '320px', lineHeight: '1.5' }}>
              Hardcore training facility and professional gym management system. Committed to elite fitness, strength conditioning, and healthy lifestyles.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-bold small text-uppercase mb-2.5" style={{ letterSpacing: '0.05em' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-1.5">
              <li>
                <Link to="/" className="text-secondary text-decoration-none hover-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/plans" className="text-secondary text-decoration-none hover-white">
                  Plans & Offers
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="text-secondary text-decoration-none hover-white">
                  Gym Equipment
                </Link>
              </li>
              <li>
                <Link to="/supplements" className="text-secondary text-decoration-none hover-white">
                  Supplements Store
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-secondary text-decoration-none hover-white">
                  Events & Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Gym Timings Column */}
          <div className="col-6 col-md-3">
            <h6 className="text-white fw-bold small text-uppercase mb-2.5" style={{ letterSpacing: '0.05em' }}>
              Gym Timings
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-1.5 text-secondary">
              <li className="d-flex justify-content-between">
                <span>Mon - Fri:</span>
                <span className="text-white fw-semibold">5:30 AM - 10:30 PM</span>
              </li>
              <li className="d-flex justify-content-between">
                <span>Saturday:</span>
                <span className="text-white fw-semibold">5:30 AM - 10:00 PM</span>
              </li>
              <li className="d-flex justify-content-between">
                <span>Sunday:</span>
                <span className="text-danger fw-semibold">Holiday</span>
              </li>
              <li className="pt-1 text-muted" style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-clock me-1 text-warning"></i> Trainers available all shifts
              </li>
            </ul>
          </div>

          {/* Contact & Support Column */}
          <div className="col-12 col-md-3">
            <h6 className="text-white fw-bold small text-uppercase mb-2.5" style={{ letterSpacing: '0.05em' }}>
              Club Support
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2 text-secondary">
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt text-warning flex-shrink-0"></i>
                <span>Hulk Fitness Center, Main Gym Blvd</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone text-warning flex-shrink-0"></i>
                <a href="tel:+918320132548" className="text-secondary text-decoration-none hover-white">
                  +91 83201 32548
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope text-warning flex-shrink-0"></i>
                <span>support@hulkfitness.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Clean and Professional */}
        <div className="border-top border-secondary border-opacity-25 pt-3 text-center small text-secondary">
          <p className="mb-0">
            © {new Date().getFullYear()} <span className="text-white fw-semibold">Hulk Fitness</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
