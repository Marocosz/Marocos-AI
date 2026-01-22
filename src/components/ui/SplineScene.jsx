import React, { Suspense, lazy } from 'react';

// Lazy load Spline to optimize performance
const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineScene({ scene, className }) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader">Loading 3D...</span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    </Suspense>
  );
}
