import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', linkTo = '/', className = '' }) {
  const sizes = {
    sm: { box: 'w-7 h-7 rounded-lg text-sm', text: 'text-base' },
    md: { box: 'w-8 h-8 rounded-lg text-sm', text: 'text-lg' },
    lg: { box: 'w-10 h-10 rounded-xl text-base', text: 'text-xl' },
  };
  const s = sizes[size] || sizes.md;
  const inner = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className={`${s.box} bg-[#F2782E] flex items-center justify-center font-extrabold text-white flex-shrink-0`}>K</span>
      <span className={`font-bold text-inherit ${s.text} leading-tight`}>
        Kreatix<span className="text-[#F2782E]">Tech</span>
      </span>
    </span>
  );
  if (!linkTo) return inner;
  return <Link to={linkTo} className="focus:outline-none">{inner}</Link>;
}
