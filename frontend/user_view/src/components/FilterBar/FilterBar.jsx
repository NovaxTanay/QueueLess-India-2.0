import { FaSearch, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import './FilterBar.css';

const FilterBar = ({
  searchValue = '',
  onSearchChange,
  locationValue = '',
  onLocationChange,
  crowdFilter = '',
  onCrowdFilterChange,
  locations = ['Delhi', 'Gurugram', 'Noida'],
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-bar-group">
        <FaSearch className="filter-bar-icon" size={14} />
        <input
          className="filter-bar-input"
          type="text"
          placeholder="Search services..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          id="filter-search"
        />
      </div>

      <span className="filter-bar-divider" />

      <div className="filter-bar-group">
        <FaMapMarkerAlt className="filter-bar-icon" size={14} />
        <select
          className="filter-bar-select"
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          id="filter-location"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <span className="filter-bar-divider" />

      <div className="filter-bar-group">
        <FaFilter className="filter-bar-icon" size={14} />
        <select
          className="filter-bar-select"
          value={crowdFilter}
          onChange={(e) => onCrowdFilterChange(e.target.value)}
          id="filter-crowd"
        >
          <option value="">All Crowd Levels</option>
          <option value="low">Low Crowd</option>
          <option value="medium">Moderate</option>
          <option value="high">Crowded</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
