/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neon: {
          blue: '#00f6ff',
          red: '#ff004d',
          yellow: '#faff00',
          purple: '#8b5cf6',
          green: '#00ff88',
          pink: '#ff0080',
        },
        beyblade: {
          dark: '#05011a',
          purple: '#1c0066',
          violet: '#6b00ff',
          gold: '#ffd700',
          silver: '#c0c0c0',
        }
      },
      fontFamily: {
        'anime': ['Orbitron', 'monospace'],
        'beyblade': ['Exo 2', 'sans-serif'],
        'arcade': ['Press Start 2P', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'energy-burst': 'energy-burst 0.6s ease-out',
        'beyblade-spin': 'beyblade-spin 2s linear infinite',
        'particle-float': 'particle-float 4s ease-in-out infinite',
        'lens-flare': 'lens-flare 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px #00f6ff, 0 0 10px #00f6ff, 0 0 15px #00f6ff',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 10px #00f6ff, 0 0 20px #00f6ff, 0 0 30px #00f6ff',
            transform: 'scale(1.05)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'glow': {
          '0%': { 
            textShadow: '0 0 5px #00f6ff, 0 0 10px #00f6ff, 0 0 15px #00f6ff',
            color: '#00f6ff'
          },
          '100%': { 
            textShadow: '0 0 10px #ff004d, 0 0 20px #ff004d, 0 0 30px #ff004d',
            color: '#ff004d'
          }
        },
        'energy-burst': {
          '0%': { 
            transform: 'scale(0) rotate(0deg)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scale(1.2) rotate(180deg)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(2) rotate(360deg)',
            opacity: '0'
          }
        },
        'beyblade-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        },
        'particle-float': {
          '0%': { 
            transform: 'translateY(100vh) rotate(0deg)',
            opacity: '0'
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { 
            transform: 'translateY(-100vh) rotate(360deg)',
            opacity: '0'
          }
        },
        'lens-flare': {
          '0%, 100%': { 
            transform: 'rotate(0deg) scale(1)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'rotate(180deg) scale(1.5)',
            opacity: '0.8'
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'beyblade-bg': 'linear-gradient(135deg, #05011a 0%, #1c0066 50%, #6b00ff 100%)',
        'energy-burst': 'radial-gradient(circle, #00f6ff 0%, #ff004d 50%, transparent 70%)',
        'neon-glow': 'linear-gradient(45deg, #00f6ff, #ff004d, #faff00, #8b5cf6)',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00f6ff, 0 0 10px #00f6ff, 0 0 15px #00f6ff, 0 0 20px #00f6ff',
        'neon-red': '0 0 5px #ff004d, 0 0 10px #ff004d, 0 0 15px #ff004d, 0 0 20px #ff004d',
        'neon-yellow': '0 0 5px #faff00, 0 0 10px #faff00, 0 0 15px #faff00, 0 0 20px #faff00',
        'neon-purple': '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6, 0 0 20px #8b5cf6',
        'glow': '0 0 20px rgba(0, 246, 255, 0.5), 0 0 40px rgba(0, 246, 255, 0.3), 0 0 60px rgba(0, 246, 255, 0.1)',
      },
      textShadow: {
        'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
        'glow': '0 0 10px #00f6ff, 0 0 20px #00f6ff, 0 0 30px #00f6ff',
      }
    },
  },
  plugins: [],
}





