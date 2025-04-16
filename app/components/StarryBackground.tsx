import { useEffect, useState } from 'react';

export function StarryBackground() {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars = Array.from({ length: 200 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3,
      }));
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
} 