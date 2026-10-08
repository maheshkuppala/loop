import React, { useState, useEffect, useRef } from 'react';

export const AnimatedCounter = ({
  value,
  duration = 2000,
  className = '',
  style = {}
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(String(value));
      return;
    }

    // Parse string value into numeric part and non-numeric prefix/suffix
    const stringVal = String(value);
    const match = stringVal.match(/^([^\d]*)([\d,.]+)(.*)$/);

    if (!match) {
      setDisplayValue(stringVal);
      return;
    }

    const prefix = match[1] || '';
    const numberStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNumber = parseFloat(numberStr);
    const isFloat = numberStr.includes('.');
    const decimalPlaces = isFloat ? (numberStr.split('.')[1] || '').length : 0;

    if (isNaN(targetNumber)) {
      setDisplayValue(stringVal);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          let startTime = null;

          const animateCount = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out cubic easing function
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = easeOutProgress * targetNumber;

            const formattedNum = isFloat
              ? currentCount.toFixed(decimalPlaces)
              : Math.floor(currentCount).toLocaleString('en-US');

            setDisplayValue(`${prefix}${formattedNum}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              setDisplayValue(stringVal);
            }
          };

          requestAnimationFrame(animateCount);
        }
      },
      { threshold: 0.2 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={counterRef} className={`animated-counter ${className}`} style={style}>
      {displayValue}
    </span>
  );
};

export default AnimatedCounter;
