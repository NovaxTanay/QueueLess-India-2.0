import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const IconComponent = category.icon;

  const handleClick = () => {
    navigate(`/services/${category.id}`);
  };

  return (
    <div
      className="category-card"
      onClick={handleClick}
      style={{ '--cat-color': category.color }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div style={{ background: `${category.color}22`, color: category.color }} className="category-card-icon">
        <IconComponent />
      </div>
      <div className="category-card-content">
        <h3 className="category-card-name">{category.name}</h3>
        <p className="category-card-desc">{category.description}</p>
      </div>
      <div className="category-card-footer">
        <span className="category-card-count">{category.serviceCount} services</span>
        <span className="category-card-arrow" style={{ color: category.color }}>
          <FaArrowRight size={12} />
        </span>
      </div>
      <style>{`.category-card::before { background: ${category.gradient}; }`}</style>
    </div>
  );
};

export default CategoryCard;
