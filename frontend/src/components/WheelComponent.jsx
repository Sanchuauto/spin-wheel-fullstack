import React, { useEffect, useState } from 'react';

const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

const WheelComponent = ({ offers, onSpinFinish, isSpinning, winningOfferIndex }) => {
    const [rotation, setRotation] = useState(0);
    const [currentRotationAngle, setCurrentRotationAngle] = useState(0);
    const [activeBulb, setActiveBulb] = useState(-1);

    useEffect(() => {
        let bulbInterval;
        if (isSpinning) {
            bulbInterval = setInterval(() => {
                setActiveBulb((prev) => (prev + 1) % 20);
            }, 100);
        } else {
            setActiveBulb(-1);
        }
        return () => clearInterval(bulbInterval);
    }, [isSpinning]);

    useEffect(() => {
        if (isSpinning && winningOfferIndex !== null) {
            const segmentAngle = 360 / offers.length;

            // The segment index we want to land on is winningOfferIndex
            // We want this segment to be at the top (270 degrees in SVG coordinate system)
            const targetSegmentMiddleAngle = (winningOfferIndex + 0.5) * segmentAngle;

            // To bring targetSegmentMiddleAngle to 270:
            // currentRotation + delta = 270 - targetSegmentMiddleAngle + (n * 360)

            const targetAngle = 270 - targetSegmentMiddleAngle;

            // Current normalized rotation
            const currentNormalized = currentRotationAngle % 360;

            // Calculate how much we need to rotate to get to targetAngle
            let delta = targetAngle - currentNormalized;
            if (delta < 0) delta += 360;

            // Add multiple full spins (minimum 5 full spins)
            const extraSpins = 5 + Math.floor(Math.random() * 3);
            const finalRotation = currentRotationAngle + (extraSpins * 360) + delta;

            setRotation(finalRotation);

            const timeout = setTimeout(() => {
                setCurrentRotationAngle(finalRotation);
                onSpinFinish();
            }, 5000); // Matches the 5s CSS transition exactly

            return () => clearTimeout(timeout);
        }
    }, [isSpinning, winningOfferIndex, offers.length, onSpinFinish]); // Removed currentRotationAngle to prevent re-triggering mid-spin

    const radius = 140;
    const centerX = 150;
    const centerY = 150;
    const rimRadius = 155;

    const createSector = (index, length) => {
        const angle = 360 / length;
        const startAngle = index * angle;
        const endAngle = (index + 1) * angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        return `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    };

    const getFontSize = (text, lines) => {
        const longestLine = Math.max(...lines.map(line => line.length));
        if (longestLine <= 6) return 16;
        if (longestLine <= 10) return 14;
        if (longestLine <= 14) return 12;
        return 10;
    };

    const splitTextIntoLines = (text) => {
        const words = text.split(' ');
        if (words.length <= 1 || text.length <= 12) return [text];

        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            if ((currentLine + ' ' + words[i]).length <= 12) {
                currentLine += ' ' + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);

        // Limit to 3 lines max
        if (lines.length > 3) {
            const extra = lines.slice(2).join(' ');
            return [lines[0], lines[1], extra];
        }
        return lines;
    };

    return (
        <div className="relative w-full max-w-[340px] md:max-w-[460px] mx-auto p-4">
            {/* Top Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 filter drop-shadow(0 4px 6px rgba(0,0,0,0.3))">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <path d="M20 35 L5 5 L35 5 Z" fill="#E11D48" stroke="#fff" strokeWidth="2" />
                </svg>
            </div>

            <div className="relative premium-wheel-container border-[8px] border-[#D4AF37] rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#1a1a1a]">
                {/* Bulbs Rim */}
                <svg width="100%" height="100%" viewBox="0 0 300 300" className="absolute inset-0 z-20 pointer-events-none">
                    {[...Array(20)].map((_, i) => {
                        const angle = (i * 360) / 20;
                        const rad = (angle * Math.PI) / 180;
                        const x = centerX + rimRadius * Math.cos(rad);
                        const y = centerY + rimRadius * Math.sin(rad);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#ffffff"
                                className={`bulb ${activeBulb === i ? 'bulb-active' : 'opacity-80'}`}
                            />
                        );
                    })}
                </svg>

                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 300 300"
                    className="wheel-svg relative z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Ring background */}
                    <circle cx={centerX} cy={centerY} r={radius + 4} fill="#222" />

                    {offers.map((offer, index) => {
                        const isRed = index % 2 === 0;
                        const bgColor = isRed ? '#E11D48' : '#FFFFFF';
                        const textColor = isRed ? '#FFFFFF' : '#E11D48';
                        const segmentAngle = 360 / offers.length;
                        const middleAngle = (index + 0.5) * segmentAngle;

                        // Calculate text position (65% of radius)
                        const textRadius = radius * 0.65;
                        const textRad = (middleAngle * Math.PI) / 180;
                        const tx = centerX + textRadius * Math.cos(textRad);
                        const ty = centerY + textRadius * Math.sin(textRad);

                        // Rotate text to match slice angle
                        let textRotation = middleAngle;
                        const isUpsideDown = middleAngle > 90 && middleAngle < 270;
                        if (isUpsideDown) {
                            textRotation += 180;
                        }

                        const lines = splitTextIntoLines(offer.offerName);
                        const fontSize = getFontSize(offer.offerName, lines);

                        return (
                            <g key={offer.id || index}>
                                <path
                                    d={createSector(index, offers.length)}
                                    fill={bgColor}
                                    stroke="#000"
                                    strokeWidth="1"
                                />
                                <text
                                    x={tx}
                                    y={ty}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={textColor}
                                    fontSize={fontSize}
                                    fontWeight="900"
                                    transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                                    className="uppercase tracking-tight"
                                    style={{
                                        paintOrder: 'stroke',
                                        stroke: isRed ? 'rgba(255,255,255,0.05)' : 'rgba(225,29,72,0.05)',
                                        strokeWidth: '1px'
                                    }}
                                >
                                    {lines.map((line, i) => (
                                        <tspan
                                            key={i}
                                            x={tx}
                                            dy={i === 0 ? `-${(lines.length - 1) * 0.6}em` : '1.2em'}
                                        >
                                            {line}
                                        </tspan>
                                    ))}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Casino Gold Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full z-20 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FBBF24] via-[#D4AF37] to-[#B45309] shadow-[0_0_20px_rgba(0,0,0,0.4)] border-4 border-[#FDE68A] flex items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-[#D4AF37]">
                            <span className="text-xl md:text-2xl text-[#FBBF24] font-bold">WIN</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WheelComponent;
