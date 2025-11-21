import React, { useState, useEffect } from 'react';
import { getReviews, createReview, updateReview, uploadImage, deleteReview, exportReviews, importReviews } from './api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import './index.css';

const translations = {
  en: {
    appTitle: "🍔 BurgerLog",
    sortNewest: "Newest Date",
    sortOldest: "Oldest Date",
    sortHighRating: "Highest Rating",
    sortLowRating: "Lowest Rating",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    switchLang: "日本語へ切り替え",
    addReview: "Add Review",
    editReview: "Edit Review",
    newReview: "New Burger Review",
    shopName: "Shop Name",
    burgerName: "Burger Name",
    overallRating: "Overall Rating",
    style: "Style",
    volume: "Volume",
    patty: "Patty",
    buns: "Buns",
    sauce: "Sauce",
    price: "Price",
    visitDate: "Visit Date",
    comment: "Comment",
    image: "Photo",
    save: "Save",
    update: "Update",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this review?",
    importConfirm: "Importing will add to current reviews. Continue?",
    importSuccess: "Import successful!",
    importFail: "Import failed",
    exportFail: "Export failed",
    saveSuccess: "Review saved!",
    updateSuccess: "Review updated!",
    saveFail: "Failed to save. Please try again.",
    uploadFail: "Failed to upload image",
    deleteFail: "Failed to delete",
    currentImage: "Current Image:",
    shop: "Shop",
    priceLabel: "Price",
    dateLabel: "Date",
    overallRatingLabel: "Overall Rating",
    styleRating: "Style",
    volumeRating: "Volume",
    pattyRating: "Patty",
    bunsRating: "Buns",
    sauceRating: "Sauce",
    // Slider Labels
    styleLeft: "Junk", styleRight: "Rich",
    volumeLeft: "Light", volumeRight: "Heavy",
    pattyLeft: "Balanced", pattyRight: "Meaty",
    bunsLeft: "Soft", bunsRight: "Hard",
    sauceLeft: "Mild", sauceRight: "Strong"
  },
  ja: {
    appTitle: "🍔 BurgerLog",
    sortNewest: "日付 (新しい順)",
    sortOldest: "日付 (古い順)",
    sortHighRating: "評価 (高い順)",
    sortLowRating: "評価 (低い順)",
    exportJson: "JSONエクスポート",
    importJson: "JSONインポート",
    switchLang: "Switch to English",
    addReview: "レビューを追加",
    editReview: "レビューを編集",
    newReview: "新規バーガーレビュー",
    shopName: "店名",
    burgerName: "バーガー名",
    overallRating: "総合評価",
    style: "スタイル",
    volume: "ボリューム",
    patty: "パティ",
    buns: "バンズ",
    sauce: "ソース",
    price: "価格",
    visitDate: "訪問日",
    comment: "コメント",
    image: "写真",
    save: "保存",
    update: "更新",
    cancel: "キャンセル",
    delete: "削除",
    confirmDelete: "本当にこのレビューを削除しますか？",
    importConfirm: "インポートすると現在のレビューに追加されます。続けますか？",
    importSuccess: "インポートに成功しました！",
    importFail: "インポートに失敗しました",
    exportFail: "エクスポートに失敗しました",
    saveSuccess: "レビューを保存しました！",
    updateSuccess: "レビューを更新しました！",
    saveFail: "保存に失敗しました。もう一度お試しください。",
    uploadFail: "画像のアップロードに失敗しました",
    deleteFail: "削除に失敗しました",
    currentImage: "現在の画像:",
    shop: "店",
    priceLabel: "価格",
    dateLabel: "日付",
    overallRatingLabel: "総合評価",
    styleRating: "スタイル",
    volumeRating: "ボリューム",
    pattyRating: "パティ",
    bunsRating: "バンズ",
    sauceRating: "ソース",
    // Slider Labels
    styleLeft: "ジャンク", styleRight: "リッチ",
    volumeLeft: "軽め", volumeRight: "ヘビー",
    pattyLeft: "バランス", pattyRight: "肉肉しい",
    bunsLeft: "ソフト", bunsRight: "ハード",
    sauceLeft: "さっぱり", sauceRight: "濃厚"
  }
};

// Star Rating Component
const StarRating = ({ value, onChange, label }) => {
  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label className="form-label" style={{ fontSize: '0.9rem' }}>{label}</label>
        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{value}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: star <= value ? '#fbbf24' : '#475569',
              padding: 0,
              transition: 'transform 0.1s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
};

const RangeSlider = ({ value, onChange, label, leftLabel, rightLabel }) => {
  return (
    <div className="form-group">
      <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '60px', textAlign: 'right' }}>{leftLabel}</span>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#fbbf24' }}
        />
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '60px' }}>{rightLabel}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.2rem' }}>{value}</div>
    </div>
  );
};

const StarPoint = (props) => {
  const { cx, cy } = props;
  return (
    <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 24 24" fill="#fbbf24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

const CustomYAxisTickLeft = ({ x, y, payload, data, isDetail }) => {
  const item = data[payload.index];
  if (!item) return null;
  const width = isDetail ? 150 : 130;
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Category Name: Left aligned */}
      <text x={-width} y={0} dy={4} textAnchor="start" fill="#e2e8f0" fontWeight="bold" fontSize={10}>
        {payload.value}
      </text>
      {/* Left Label: Right aligned */}
      <text x={-20} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize={9}>
        {item.left}
      </text>
    </g>
  );
};

const CustomYAxisTickRight = ({ x, y, payload, data }) => {
  const item = data[payload.index];
  if (!item) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={20} y={0} dy={4} textAnchor="start" fill="#64748b" fontSize={9}>
        {item.right}
      </text>
    </g>
  );
};

const ProfileChartComponent = ({ data, isDetail }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        layout="vertical"
        data={data}
        margin={{ top: 10, right: isDetail ? 60 : 30, left: isDetail ? 60 : 30, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#334155" />
        <XAxis type="number" domain={[1, 5]} hide={true} />
        <YAxis
          dataKey="subject"
          type="category"
          tick={<CustomYAxisTickLeft data={data} isDetail={isDetail} />}
          width={isDetail ? 150 : 130}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          orientation="right"
          dataKey="subject"
          type="category"
          yAxisId="right"
          tick={<CustomYAxisTickRight data={data} />}
          width={isDetail ? 60 : 60}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <Line
          type="monotone"
          dataKey="A"
          stroke="none"
          dot={<StarPoint />}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

function App() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null); // Track if editing
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
    visit_date: '',
    comment: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState('date_desc');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState('ja');

  const t = translations[language];

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
      alert(t.exportFail);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.confirm(t.importConfirm)) {
      try {
        await importReviews(file);
        alert(t.importSuccess);
        loadReviews();
      } catch (e) {
        console.error(e);
        alert(t.importFail);
      }
    }
    e.target.value = ''; // Reset input
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'date_desc') {
      return new Date(b.visit_date || b.id) - new Date(a.visit_date || a.id); // Fallback to ID if date missing
    } else if (sortOption === 'date_asc') {
      return new Date(a.visit_date || a.id) - new Date(b.visit_date || b.id);
    } else if (sortOption === 'rating_desc') {
      return b.rating - a.rating;
    } else if (sortOption === 'rating_asc') {
      return a.rating - b.rating;
    }
    return 0;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const openEditModal = (review) => {
    setFormData({
      shop_name: review.shop_name,
      burger_name: review.burger_name,
      rating: review.rating,
      rating_style: review.rating_style,
      rating_volume: review.rating_volume,
      rating_patty: review.rating_patty,
      rating_buns: review.rating_buns || 3,
      rating_sauce: review.rating_sauce || 3,
      price: review.price,
      visit_date: review.visit_date ? review.visit_date.split('T')[0] : '',
      comment: review.comment || '',
      image_url: review.image_url || ''
    });
    setEditingReviewId(review.id);
    setSelectedReview(null); // Close detail modal
    setIsModalOpen(true);
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

      const reviewData = {
        ...formData,
        image_url: imageUrl,
        rating: parseInt(formData.rating),
        rating_style: parseInt(formData.rating_style),
        rating_volume: parseInt(formData.rating_volume),
        rating_patty: parseInt(formData.rating_patty),
        rating_buns: parseInt(formData.rating_buns),
        rating_sauce: parseInt(formData.rating_sauce),
        price: parseInt(formData.price),
        visit_date: formData.visit_date ? formData.visit_date : null
      };

      if (editingReviewId) {
        await updateReview(editingReviewId, reviewData);
        alert(t.updateSuccess);
      } else {
        await createReview(reviewData);
        alert(t.saveSuccess);
      }

      setIsModalOpen(false);
      setEditingReviewId(null); // Reset editing state
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
        visit_date: '',
        comment: '',
        image_url: ''
      });
      setImageFile(null);
      loadReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      alert(t.saveFail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await deleteReview(id);
        loadReviews();
        if (selectedReview && selectedReview.id === id) {
          setSelectedReview(null);
        }
      } catch (e) {
        console.error(e);
        alert(t.deleteFail);
      }
    }
  }

  const getChartData = (review, isDetail = false) => [
    { subject: t.style, A: review.rating_style, left: t.styleLeft, right: t.styleRight },
    { subject: t.volume, A: review.rating_volume, left: t.volumeLeft, right: t.volumeRight },
    { subject: t.patty, A: review.rating_patty, left: t.pattyLeft, right: t.pattyRight },
    { subject: t.buns, A: review.rating_buns || 3, left: t.bunsLeft, right: t.bunsRight },
    { subject: t.sauce, A: review.rating_sauce || 3, left: t.sauceLeft, right: t.sauceRight },
  ];

  return (
    <div className="container">
      <header className="header">
        <h1>{t.appTitle}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              backgroundColor: '#334155',
              color: 'white',
              border: '1px solid #475569',
              cursor: 'pointer'
            }}
          >
            <option value="date_desc">{t.sortNewest}</option>
            <option value="date_asc">{t.sortOldest}</option>
            <option value="rating_desc">{t.sortHighRating}</option>
            <option value="rating_asc">{t.sortLowRating}</option>
          </select>
        </div>
      </header>

      {/* Settings FAB */}
      <button
        className="fab-secondary"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        aria-label="Settings"
      >
        ⚙️
      </button>

      {isSettingsOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="settings-menu-container">
            <div className="settings-dropdown-up">
              <button className="settings-item" onClick={() => { setLanguage(language === 'en' ? 'ja' : 'en'); setIsSettingsOpen(false); }}>
                {t.switchLang}
              </button>
              <button className="settings-item" onClick={() => { handleExport(); setIsSettingsOpen(false); }}>
                {t.exportJson}
              </button>
              <label className="settings-item" style={{ cursor: 'pointer' }}>
                {t.importJson}
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => { handleImport(e); setIsSettingsOpen(false); }} />
              </label>
            </div>
          </div>
        </>
      )}

      <button className="fab" onClick={() => {
        setEditingReviewId(null);
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
          visit_date: '',
          comment: '',
          image_url: ''
        });
        setIsModalOpen(true);
      }} aria-label={t.addReview}>
        +
      </button>

      <div className="grid">
        {sortedReviews.map(review => (
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
              <p className="card-subtitle">
                at {review.shop_name}
                {review.visit_date && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#64748b' }}>({new Date(review.visit_date).toLocaleDateString()})</span>}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="rating-badge">★ {review.rating}</span>
                <span className="rating-badge">¥{review.price}</span>
              </div>

              <div className="radar-chart-container" style={{ height: '150px', marginTop: '0.5rem', background: 'transparent', padding: 0 }}>
                <ProfileChartComponent data={getChartData(review, false)} isDetail={false} />
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => openEditModal(selectedReview)} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{t.editReview}</button>
                <button onClick={() => setSelectedReview(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>
            </div>

            {selectedReview.image_url && (
              <img
                src={selectedReview.image_url}
                alt={selectedReview.burger_name}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '0.5rem', marginBottom: '1.5rem' }}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.shop}</h3>
                <div style={{ fontSize: '1.2rem' }}>{selectedReview.shop_name}</div>
              </div>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.priceLabel}</h3>
                <div style={{ fontSize: '1.2rem' }}>¥{selectedReview.price}</div>
              </div>
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.dateLabel}</h3>
                <div style={{ fontSize: '1.2rem' }}>{selectedReview.visit_date ? new Date(selectedReview.visit_date).toLocaleDateString() : '-'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.overallRating}</h3>

              <div style={{ textAlign: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.2rem' }}>{t.overallRatingLabel}</div>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fbbf24' }}>★ {selectedReview.rating}</span>
                <span style={{ fontSize: '1.2rem', color: '#94a3b8', marginLeft: '0.5rem' }}>/ 5</span>
              </div>

              <div className="radar-chart-container" style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                <ProfileChartComponent data={getChartData(selectedReview, true)} isDetail={true} />
              </div>
            </div>

            <div>
              <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.comment}</h3>
              <p style={{ lineHeight: '1.6', color: '#e2e8f0' }}>{selectedReview.comment}</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal">
            <h2>{editingReviewId ? t.editReview : t.newReview}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t.shopName}</label>
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
                <StarRating
                  label="Overall Rating"
                  value={formData.rating}
                  onChange={(val) => handleRatingChange('rating', val)}
                />
              </div>

              <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <RangeSlider
                  label={t.styleRating}
                  leftLabel={t.styleLeft}
                  rightLabel={t.styleRight}
                  value={formData.rating_style}
                  onChange={(val) => handleRatingChange('rating_style', val)}
                />
                <RangeSlider
                  label={t.volumeRating}
                  leftLabel={t.volumeLeft}
                  rightLabel={t.volumeRight}
                  value={formData.rating_volume}
                  onChange={(val) => handleRatingChange('rating_volume', val)}
                />
                <RangeSlider
                  label={t.pattyRating}
                  leftLabel={t.pattyLeft}
                  rightLabel={t.pattyRight}
                  value={formData.rating_patty}
                  onChange={(val) => handleRatingChange('rating_patty', val)}
                />
                <RangeSlider
                  label={t.bunsRating}
                  leftLabel={t.bunsLeft}
                  rightLabel={t.bunsRight}
                  value={formData.rating_buns}
                  onChange={(val) => handleRatingChange('rating_buns', val)}
                />
                <RangeSlider
                  label={t.sauceRating}
                  leftLabel={t.sauceLeft}
                  rightLabel={t.sauceRight}
                  value={formData.rating_sauce}
                  onChange={(val) => handleRatingChange('rating_sauce', val)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" className="form-input" onChange={handleImageChange} accept="image/*" />
                {editingReviewId && formData.image_url && !imageFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Current image: {formData.image_url.split('/').pop()}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Visit Date</label>
                <input type="date" className="form-input" name="visit_date" value={formData.visit_date} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-textarea" name="comment" value={formData.comment} onChange={handleInputChange} rows="3"></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#475569' }} onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (editingReviewId ? 'Update Review' : 'Save Review')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
