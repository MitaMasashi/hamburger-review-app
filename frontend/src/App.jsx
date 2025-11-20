import React, { useState, useEffect } from 'react';
import { getReviews, createReview, uploadImage, deleteReview, exportReviews, importReviews } from './api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './index.css';

function App() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    burger_name: '',
    rating: 5,
    rating_style: 3,
    rating_volume: 3,
    rating_patty: 3,
    rating_buns: 3,
    rating_sauce: 3,
    price: 1000,
    visit_date: new Date().toISOString().split('T')[0],
    comment: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportReviews();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `burger_reviews_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.confirm("Importing will append reviews from the file. Continue?")) {
      try {
        await importReviews(file);
        alert("Import successful!");
        loadReviews();
      } catch (e) {
        console.error(e);
        alert("Import failed");
      }
    }
    e.target.value = ''; // Reset input
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      await createReview({
        ...formData,
        image_url: imageUrl,
        rating: parseInt(formData.rating),
        rating_style: parseInt(formData.rating_style),
        rating_volume: parseInt(formData.rating_volume),
        rating_patty: parseInt(formData.rating_patty),
        rating_buns: parseInt(formData.rating_buns),
        rating_sauce: parseInt(formData.rating_sauce),
        price: parseInt(formData.price)
      });

      setIsModalOpen(false);
      setFormData({
        shop_name: '',
        burger_name: '',
        rating: 5,
        rating_style: 3,
        rating_volume: 3,
        rating_patty: 3,
        rating_buns: 3,
        rating_sauce: 3,
        price: 1000,
        visit_date: new Date().toISOString().split('T')[0],
        comment: '',
        image_url: ''
      });
      setImageFile(null);
      loadReviews();
      alert("Review saved successfully!");
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id);
        loadReviews();
      } catch (e) {
        console.error(e);
        alert("Failed to delete");
      }
    }
  }

  const getChartData = (review) => [
    { subject: 'Style', A: review.rating_style, fullMark: 5 },
    { subject: 'Volume', A: review.rating_volume, fullMark: 5 },
    { subject: 'Patty', A: review.rating_patty, fullMark: 5 },
    { subject: 'Buns', A: review.rating_buns || 3, fullMark: 5 },
    { subject: 'Sauce', A: review.rating_sauce || 3, fullMark: 5 },
  ];

  return (
    <div className="container">
      <header className="header">
        <h1>🍔 BurgerLog</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ backgroundColor: '#334155' }} onClick={handleExport}>
            Export JSON
          </button>
          <label className="btn" style={{ backgroundColor: '#334155', cursor: 'pointer' }}>
            Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </header>

      <button className="fab" onClick={() => setIsModalOpen(true)} aria-label="Add Review">
        +
      </button>

      <div className="grid">
        {reviews.map(review => (
          <div key={review.id} className="card" onClick={() => setSelectedReview(review)} style={{ cursor: 'pointer' }}>
            {review.image_url && (
              <img
                src={review.image_url.replace(/(\.[\w\d_-]+)$/i, '_thumb$1')}
                onError={(e) => { e.target.onerror = null; e.target.src = review.image_url }}
                alt={review.burger_name}
                className="card-image"
              />
            )}
            <div className="card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="card-title">{review.burger_name}</h2>
                {/* Stop propagation to prevent opening modal when deleting */}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(review.id) }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>🗑️</button>
              </div>
              <p className="card-subtitle">at {review.shop_name}</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="rating-badge">★ {review.rating}</span>
                <span className="rating-badge">¥{review.price}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                {/* Simplified list view ratings */}
                <div>Style: {review.rating_style}/5</div>
                <div>Volume: {review.rating_volume}/5</div>
                <div>Patty: {review.rating_patty}/5</div>
                <div>Buns: {review.rating_buns || '-'}/5</div>
                <div>Sauce: {review.rating_sauce || '-'}/5</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedReview(null)}>
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2>{selectedReview.burger_name}</h2>
              <button onClick={() => setSelectedReview(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {selectedReview.image_url && (
              <img
                src={selectedReview.image_url}
                alt={selectedReview.burger_name}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '0.5rem', marginBottom: '1.5rem' }}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>SHOP</h3>
                <div style={{ fontSize: '1.2rem' }}>{selectedReview.shop_name}</div>
              </div>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PRICE</h3>
                <div style={{ fontSize: '1.2rem' }}>¥{selectedReview.price}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>RATINGS</h3>

              <div style={{ textAlign: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Overall Rating</div>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fbbf24' }}>★ {selectedReview.rating}</span>
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', marginLeft: '0.5rem' }}>/ 5</span>
              </div>

              <div className="radar-chart-container" style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getChartData(selectedReview)}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                    <Radar
                      name="Rating"
                      dataKey="A"
                      stroke="#ff9f1c"
                      fill="#ff9f1c"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>COMMENT</h3>
              <p style={{ lineHeight: '1.6', color: '#e2e8f0' }}>{selectedReview.comment}</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal">
            <h2>New Burger Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Shop Name</label>
                <input className="form-input" name="shop_name" value={formData.shop_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Burger Name</label>
                <input className="form-input" name="burger_name" value={formData.burger_name} onChange={handleInputChange} required />
              </div>

              <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input type="number" className="form-input" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Overall Rating ({formData.rating})</label>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating" value={formData.rating} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
              </div>

              <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Style (Junk - Rich)</label>
                    <span>{formData.rating_style}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating_style" value={formData.rating_style} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Volume (Light - Heavy)</label>
                    <span>{formData.rating_volume}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating_volume" value={formData.rating_volume} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Patty (Balanced - Meaty)</label>
                    <span>{formData.rating_patty}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating_patty" value={formData.rating_patty} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Buns (Soft - Hard)</label>
                    <span>{formData.rating_buns}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating_buns" value={formData.rating_buns} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Sauce (Mild - Strong)</label>
                    <span>{formData.rating_sauce}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="form-input" name="rating_sauce" value={formData.rating_sauce} onChange={handleInputChange} style={{ padding: 0 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" className="form-input" onChange={handleImageChange} accept="image/*" />
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-textarea" name="comment" value={formData.comment} onChange={handleInputChange} rows="3"></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#475569' }} onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
