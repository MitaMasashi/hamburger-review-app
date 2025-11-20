const API_URL = '';

export const getReviews = async () => {
  const response = await fetch(`${API_URL}/reviews/`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
};

export const createReview = async (reviewData) => {
  const response = await fetch(`${API_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) throw new Error('Failed to create review');
  return response.json();
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
};

export const deleteReview = async (id) => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete review');
  return response.json();
}

export const exportReviews = async () => {
  const response = await fetch(`${API_URL}/export`);
  if (!response.ok) throw new Error('Failed to export reviews');
  return response.blob();
}

export const importReviews = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to import reviews');
  return response.json();
}
