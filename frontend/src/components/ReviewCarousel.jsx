import { useEffect, useState } from 'react';
import userIcon from '../assets/user-icon.png';

function ReviewCarousel({ reviews }) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const [index, setIndex] = useState(0);
  const reviewCount = safeReviews.length;

  useEffect(() => {
    if (!reviewCount) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setIndex((i) => (i === reviewCount - 1 ? 0 : i + 1));
    }, 3000);

    return () => clearInterval(intervalId);
  }, [reviewCount]);

  if (!reviewCount) return null;

  const activeIndex = index % reviewCount;
  const prev = () => setIndex((i) => (i === 0 ? reviewCount - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviewCount - 1 ? 0 : i + 1));
  const review = safeReviews[activeIndex];

  return (
    <div className="review-carousel">
      <button className="carousel-arrow" onClick={prev} aria-label="Previous review">&larr;</button>
      <article className="public-review-card">
        <div className="public-review-avatar">
          <img src={review.imageUrl || userIcon} alt={review.user || 'User'} loading="lazy" decoding="async" />
        </div>
        <p className="public-review-comment">"{review.comment}"</p>
        <div className="public-review-meta">
          <strong>{review.user}</strong>
          <span>{review.rating ? '*'.repeat(normalizeRating(review.rating)) : ''}</span>
          <small>{review.updatedAt || review.date}</small>
        </div>
      </article>
      <button className="carousel-arrow" onClick={next} aria-label="Next review">&rarr;</button>
    </div>
  );
}

function normalizeRating(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(1, Math.min(5, Math.round(numeric))) : 5;
}

export default ReviewCarousel;
