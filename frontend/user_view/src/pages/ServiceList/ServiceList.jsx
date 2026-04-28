import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import useServices from '@backend/hooks/useServices';
import categoriesData from '../../data/categories';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import FilterBar from '../../components/FilterBar/FilterBar';
import './ServiceList.css';

const ServiceList = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState('');
  const [crowdFilter, setCrowdFilter] = useState('');

  // Real-time Firestore subscription filtered by category
  const filters = useMemo(() => ({
    category,
    location: location || undefined,
    search: search || undefined,
  }), [category, location, search]);

  const { services, loading } = useServices(filters, true);

  const categoryInfo = categoriesData.find(c => c.id === category);

  return (
    <div className="service-list-page">
      <div className="container">
        <div className="service-list-header">
          <div className="service-list-breadcrumb">
            <Link to="/">Home</Link>
            <FaChevronRight size={10} />
            <span>{categoryInfo?.name || 'Services'}</span>
          </div>
          <h1 className="service-list-title">
            {categoryInfo?.name || 'All Services'}
          </h1>
          <p className="service-list-subtitle">
            {categoryInfo?.description || 'Browse and book services across all categories.'}
          </p>
        </div>

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          locationValue={location}
          onLocationChange={setLocation}
          crowdFilter={crowdFilter}
          onCrowdFilterChange={setCrowdFilter}
        />

        <div className="service-list-results">
          <span>{services.length} service{services.length !== 1 ? 's' : ''} found</span>
        </div>

        {loading ? (
          <div className="home-loading">
            <div className="home-loading-spinner" />
          </div>
        ) : (
          <div className="service-list-grid stagger-children">
            {services.length > 0 ? (
              services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              <div className="service-list-empty">
                <div className="service-list-empty-icon">🔍</div>
                <h3>No services found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
