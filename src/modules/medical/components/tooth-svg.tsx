// Real Doctocliq tooth SVGs - Different types for each tooth position

// Molar (18, 17, 16, 26, 27, 28, 36, 37, 38, 46, 47, 48)
export const MolarSVG = () => (
  <svg viewBox="0 0 80 150" className="w-full h-full">
    <defs>
      <filter id="shadow-molar" height="1.3" y="-0.1" width="1.2" x="-0.1">
        <feGaussianBlur stdDeviation="5.6"/>
      </filter>
    </defs>
    <g transform="translate(-53.4,-32.8)">
      <g transform="matrix(1,0,0,-1,91.4,284.2)">
        {/* Main body - Molar */}
        <path 
          d="m -7.9,212.8 c 1.3,9.7 3.5,16.4 6.7,17.8 3.2,1.3 7.5,-2.7 9.7,-5.5 2.2,-2.7 2.4,-4.1 3.2,-11.9 0.8,-7.8 2.3,-22.1 -1.2,-29.0 -3.6,-6.9 -12.3,-6.7 -16.4,-0.1 -4.0,6.5 -3.4,19.2 -2.1,29.0 z" 
          fill="#d8d2c2" 
          stroke="none"
        />
        {/* Crown detail */}
        <path 
          d="m -24.6,164.1 c 4.5,8.0 7.1,17.2 7.4,26.5 0.2,7.9 -1.1,16.0 -0.0,23.9 0.6,4.9 2.3,9.7 3.4,14.6" 
          fill="#eee3ce" 
          stroke="none"
        />
        {/* Occlusal surface */}
        <path 
          d="m -24.5,164.1 c -1.4,-6.6 -1.3,-13.6 0.3,-20.2 0.3,-1.4 0.8,-2.8 1.5,-4.1" 
          fill="#ececec" 
          stroke="none"
        />
      </g>
    </g>
  </svg>
)

// Premolar (14, 15, 24, 25, 34, 35, 44, 45)
export const PremolarSVG = () => (
  <svg viewBox="0 0 80 150" className="w-full h-full">
    <g transform="translate(-40.0,-69.8)">
      <g transform="matrix(2.05,0,0,-2.26,-154.2,422.6)">
        {/* Premolar body */}
        <path 
          d="m 108.7,120.2 c -0.3,-1.0 -0.6,-2.0 -1.1,-3.0 -0.5,-1.3 -1.1,-2.6 -1.4,-4.1 -0.3,-1.5 -0.5,-3.0 -0.6,-4.5" 
          fill="#ececec" 
          stroke="#cccccc" 
          strokeWidth="0.05"
        />
        {/* Crown */}
        <ellipse 
          cx="107" 
          cy="115" 
          rx="3" 
          ry="4" 
          fill="#eee3ce" 
          stroke="none"
        />
        {/* Root */}
        <path 
          d="m 107,108 c -0.5,-5 -1.0,-10 -1.5,-15" 
          fill="#d8d2c2" 
          stroke="#cccccc" 
          strokeWidth="0.1"
        />
      </g>
    </g>
  </svg>
)

// Canine (13, 23, 33, 43)
export const CanineSVG = () => (
  <svg viewBox="0 0 80 150" className="w-full h-full">
    <g transform="translate(-40.0,-69.8)">
      <g transform="matrix(2.38,0,0,-2.38,-189.0,434.3)">
        {/* Pointed crown */}
        <path 
          d="m 108.7,120.2 c -0.4,-1.0 -1.0,-2.0 -1.6,-3.0 -0.6,-1.0 -1.3,-2.0 -2.0,-2.9" 
          fill="#ececec" 
          stroke="#cccccc" 
          strokeWidth="0.05"
        />
        {/* Canine tip */}
        <path 
          d="m 107,122 l -1,-3 l 1,-3 l 1,3 z" 
          fill="#eee3ce" 
          stroke="none"
        />
        {/* Long root */}
        <path 
          d="m 107,114 c -0.3,-6 -0.6,-12 -0.9,-18" 
          fill="#d8d2c2" 
          stroke="#cccccc" 
          strokeWidth="0.08"
        />
      </g>
    </g>
  </svg>
)

// Incisor (11, 12, 21, 22, 31, 32, 41, 42)
export const IncisorSVG = () => (
  <svg viewBox="0 0 80 150" className="w-full h-full">
    <g transform="translate(-40.0,-69.8)">
      <g transform="matrix(2.06,0,0,2.06,-156.1,-118.3)">
        {/* Flat crown */}
        <path 
          d="m 107.4,131.8 c -0.4,1.0 -0.7,2.1 -1.0,3.2 -0.3,1.1 -0.5,2.2 -0.7,3.3" 
          fill="#ececec" 
          stroke="#cccccc" 
          strokeWidth="0.06"
        />
        {/* Incisal edge */}
        <rect 
          x="105" 
          y="130" 
          width="4" 
          height="2" 
          fill="#eee3ce" 
          stroke="none"
        />
        {/* Straight root */}
        <path 
          d="m 107,138 c 0,5 0,10 0,15" 
          fill="#d8d2c2" 
          stroke="#cccccc" 
          strokeWidth="0.1"
        />
      </g>
    </g>
  </svg>
)

// Export function to get the right tooth type
export const getToothSVG = (toothNumber: number) => {
  const position = toothNumber % 10
  
  // Incisors (1, 2)
  if (position === 1 || position === 2) return IncisorSVG
  
  // Canines (3)
  if (position === 3) return CanineSVG
  
  // Premolars (4, 5)
  if (position === 4 || position === 5) return PremolarSVG
  
  // Molars (6, 7, 8)
  return MolarSVG
}
