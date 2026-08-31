import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', linkTo = '/', className = '' }) {
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };
  const h = heights[size] || heights.md;
  const inner = (
    <img
      src="/images/kreatix-logo-light.png"
      alt="Kreatix Technologies"
      className={`w-auto ${h} object-contain ${className}`}
    />
  );
  if (!linkTo) return inner;
  return <Link to={linkTo} className="focus:outline-none inline-flex items-center">{inner}</Link>;
}
