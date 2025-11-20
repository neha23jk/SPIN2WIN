import React from 'react'

// Static Spin 2 Win logo image
const BeybladeIcon = ({ className = "w-8 h-8", alt = "Spin 2 Win" }) => {
  return (
    <img
      src="/assets/spin_2_win_logo.png"
      alt={alt}
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  )
}

export default BeybladeIcon
