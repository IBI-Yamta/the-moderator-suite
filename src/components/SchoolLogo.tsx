import React from "react";

interface SchoolLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "watermark" | "custom";
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: "w-12 h-14",
    md: "w-20 h-24",
    lg: "w-28 h-32",
    xl: "w-36 h-42",
    watermark: "w-72 h-84 sm:w-96 sm:h-112 md:w-[420px] md:h-[500px]",
    custom: "w-full h-full",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${dim} ${className}`}>
      <svg
        viewBox="0 0 400 480"
        className="w-full h-full object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Green Shield Border */}
        <path
          d="M 20 20 L 380 20 L 380 280 C 380 370 200 440 200 440 C 200 440 20 370 20 280 Z"
          fill="#FFFFFF"
          stroke="#00873E"
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Inner Green Shield Border */}
        <path
          d="M 55 60 L 345 60 L 345 260 C 345 335 200 395 200 395 C 200 395 55 335 55 260 Z"
          fill="#FFFFFF"
          stroke="#00873E"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Top Text: ATTARBIYYA */}
        <text
          x="200"
          y="48"
          textAnchor="middle"
          fill="#000000"
          fontFamily="'Times New Roman', Times, serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="4"
        >
          ATTARBIYYA
        </text>

        {/* Left Vertical Text: COMMUNITY */}
        <g transform="translate(42, 220) rotate(-90)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#000000"
            fontFamily="'Times New Roman', Times, serif"
            fontSize="26"
            fontWeight="900"
            letterSpacing="6"
          >
            COMMUNITY
          </text>
        </g>

        {/* Right Vertical Text: COLLEGE */}
        <g transform="translate(362, 220) rotate(90)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#000000"
            fontFamily="'Times New Roman', Times, serif"
            fontSize="26"
            fontWeight="900"
            letterSpacing="6"
          >
            COLLEGE
          </text>
        </g>

        {/* Crescent Moon (Orange) */}
        <path
          d="M 205 85 C 170 95 160 145 190 170 C 215 190 250 175 250 175 C 215 180 180 160 175 130 C 172 108 190 92 205 85 Z"
          fill="#FF6B00"
        />

        {/* Star (Cyan Blue) */}
        <polygon
          points="228,105 233,116 244,117 236,124 238,135 228,129 218,135 220,124 212,117 223,116"
          fill="#00AEEF"
        />

        {/* Open Book in the center */}
        <g transform="translate(120, 200)">
          {/* Book Spine & Outline */}
          <path
            d="M 5 20 C 35 10 75 15 80 30 C 85 15 125 10 155 20 L 155 110 C 125 100 85 105 80 120 C 75 105 35 100 5 110 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Center Spine Line */}
          <line x1="80" y1="30" x2="80" y2="120" stroke="#000000" strokeWidth="4" />
          
          {/* Left Page Horizontal Texture Lines */}
          <line x1="20" y1="40" x2="70" y2="40" stroke="#000000" strokeWidth="2.5" />
          <line x1="20" y1="58" x2="70" y2="58" stroke="#000000" strokeWidth="2.5" />
          <line x1="20" y1="76" x2="70" y2="76" stroke="#000000" strokeWidth="2.5" />
          <line x1="20" y1="94" x2="70" y2="94" stroke="#000000" strokeWidth="2.5" />

          {/* Right Page Horizontal Texture Lines */}
          <line x1="90" y1="40" x2="140" y2="40" stroke="#000000" strokeWidth="2.5" />
          <line x1="90" y1="58" x2="140" y2="58" stroke="#000000" strokeWidth="2.5" />
          <line x1="90" y1="76" x2="140" y2="76" stroke="#000000" strokeWidth="2.5" />
          <line x1="90" y1="94" x2="140" y2="94" stroke="#000000" strokeWidth="2.5" />

          {/* Book Bottom Page Layers */}
          <path
            d="M 5 110 C 35 100 75 105 80 120 C 85 105 125 100 155 110 L 158 116 C 128 106 85 112 80 125 C 75 112 32 106 2 116 Z"
            fill="#000000"
          />
        </g>

        {/* Bottom Banner / Ribbon */}
        {/* Left Ribbon Tail */}
        <polygon
          points="30,425 90,425 90,475 30,475 55,450"
          fill="#FFFFFF"
          stroke="#00873E"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Right Ribbon Tail */}
        <polygon
          points="370,425 310,425 310,475 370,475 345,450"
          fill="#FFFFFF"
          stroke="#00873E"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Center Banner Box */}
        <rect
          x="85"
          y="420"
          width="230"
          height="55"
          fill="#FFFFFF"
          stroke="#00873E"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Arabic Motto: العلم حياة (Knowledge is Life) */}
        <text
          x="200"
          y="460"
          textAnchor="middle"
          fill="#000000"
          fontFamily="'Traditional Arabic', 'Scheherazade New', 'Amiri', 'Times New Roman', serif"
          fontSize="36"
          fontWeight="bold"
          dir="rtl"
        >
          العلم حياة
        </text>
      </svg>
    </div>
  );
};
