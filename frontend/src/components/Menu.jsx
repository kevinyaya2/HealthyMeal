import { useState } from 'react';
import toast from 'react-hot-toast';

const categories = ['all', '健康餐', '高蛋白', '輕食'];

export default function Menu({
  menuItems,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  addToCart,
}) {
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name?.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} 已加入購物車`);
    setHighlightedItemId(item.id);
    setTimeout(() => {
      setHighlightedItemId((current) => (current === item.id ? null : current));
    }, 600);
  };

  return (
    <section id="menu" className="container my-5">
      <h2 className="text-center fw-bold mb-4">健康餐點列表</h2>

      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control form-control-lg shadow-sm rounded-pill px-4"
            placeholder="輸入餐點名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${categoryFilter === cat ? 'btn-success' : 'btn-outline-success'} filter-btn mx-2 rounded-pill shadow-sm`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {filteredMenu.map((item) => (
          <div className="col-md-4" key={item.id}>
            <div className={`card h-100 shadow-sm border-0 hover-effect ${highlightedItemId === item.id ? 'added-highlight' : ''}`}>
              <img
                src={`${import.meta.env.BASE_URL}${item.image}`}
                alt={item.name}
                className="card-img-top"
                style={{ height: '250px', objectFit: 'cover' }}
              />
              <div className="card-body text-center d-flex flex-column">
                <h4 className="card-title fw-bold">{item.name}</h4>
                <p className="card-text text-muted mb-2">
                  <span className="badge bg-success me-2">{item.category}</span>
                </p>
                <h5 className="text-primary mb-4">NT$ {item.price}</h5>
                <button
                  className="btn btn-success mt-auto w-100 rounded-pill shadow-sm"
                  onClick={() => handleAddToCart(item)}
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredMenu.length === 0 && (
          <div className="col-12 text-center text-muted mt-5">
            <h5>找不到符合條件的餐點</h5>
          </div>
        )}
      </div>
    </section>
  );
}
