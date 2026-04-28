import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight } from 'react-icons/fa';
import useServices from '@backend/hooks/useServices';
import categoriesData from '../../data/categories';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { services, loading } = useServices({}, true);
  const categories = categoriesData;
  const popularServices = services.slice(0, 6);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services/hospital?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero-tag fade-in-up">
            <span className="home-hero-tag-dot" />
            ✦ Live Queue Tracking
          </div>
          <h1 className="fade-in-up" style={{ animationDelay: '80ms' }}>
            Skip the Wait,<br />
            <span className="home-hero-teal">Not the Service.</span>
          </h1>
          <p className="home-hero-sub fade-in-up" style={{ animationDelay: '160ms' }}>
            Book slots, track live queues, and get real-time updates across hospitals,
            banks, government offices &amp; more — all in one place.
          </p>
          <form className="home-search fade-in-up" style={{ animationDelay: '240ms' }} onSubmit={handleSearch}>
            <FaSearch className="home-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search hospitals, banks, temples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="home-search-input"
            />
            <button className="home-search-btn" type="submit">Search</button>
          </form>

          {/* Impact Stats */}
          <div className="home-impact-row fade-in-up" style={{ animationDelay: '320ms' }}>
            <div className="home-impact-item">
              <div className="home-impact-value">{services.length > 0 ? `${services.length}+` : '500+'}</div>
              <div className="home-impact-label">Services Listed</div>
            </div>
            <div className="home-impact-divider" />
            <div className="home-impact-item">
              <div className="home-impact-value home-impact-live">
                <span className="home-live-dot" />Live
              </div>
              <div className="home-impact-label">Real-Time Queues</div>
            </div>
            <div className="home-impact-divider" />
            <div className="home-impact-item">
              <div className="home-impact-value">Firebase</div>
              <div className="home-impact-label">Powered By</div>
            </div>
            <div className="home-impact-divider" />
            <div className="home-impact-item">
              <div className="home-impact-value">100%</div>
              <div className="home-impact-label">Real-Time Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <h2 className="home-section-title">Browse Categories</h2>
          </div>
          <div className="home-categories-grid stagger-children">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Services from Firestore */}
      {services.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-header">
              <h2 className="home-section-title">Available Services</h2>
              <button className="home-section-link" onClick={() => navigate('/services/hospital')}>
                View All <FaArrowRight size={12} />
              </button>
            </div>
            <div className="home-services-scroll stagger-children">
              {popularServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
