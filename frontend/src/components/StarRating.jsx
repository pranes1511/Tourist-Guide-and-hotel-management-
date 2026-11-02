import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, max = 5, size = 16, interactive = false, onRatingChange }) => {
  const stars = [];

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <span
        key={i}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          display: 'inline-flex',
          transition: 'transform 0.1s ease',
        }}
        onClick={() => interactive && onRatingChange && onRatingChange(i)}
      >
        <Star
          size={size}
          fill={isFilled ? '#f59e0b' : 'transparent'}
          color={isFilled ? '#f59e0b' : '#cbd5e1'}
          strokeWidth={1.5}
        />
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars}
      {!interactive && rating > 0 && (
        <span style={{ marginLeft: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#f59e0b' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
