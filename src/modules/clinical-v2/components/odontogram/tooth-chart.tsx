/**
 * Clinical V2 - Tooth Chart Component
 * Interactive SVG visualization of teeth with surface selection
 */

'use client';

import React from 'react';
import { ToothChartProps, ToothNumber, ToothSurface } from '../../types';
import { ADULT_TEETH, CHILD_TEETH, SURFACES } from '../../constants/dental';
import { cn } from '@/lib/utils';

export function ToothChart({
  dentition,
  findings,
  selectedTooth,
  selectedSurface,
  onToothClick,
  readonly = false,
}: ToothChartProps) {
  const teeth = dentition === 'adult' ? ADULT_TEETH : CHILD_TEETH;

  // Get color for a specific tooth surface
  const getSurfaceColor = (tooth: ToothNumber, surface: ToothSurface): string => {
    const finding = findings.find(
      f => f.toothNumber === tooth && f.surface === surface
    );
    return finding?.color || '#ffffff';
  };

  // Check if surface is selected
  const isSurfaceSelected = (tooth: ToothNumber, surface: ToothSurface): boolean => {
    return selectedTooth === tooth && selectedSurface === surface;
  };

  // Render a single tooth with its surfaces
  const renderTooth = (toothNumber: ToothNumber, index: number) => {
    const toothKey = `tooth-${toothNumber}`;
    
    return (
      <g key={toothKey} transform={`translate(${index * 50}, 0)`}>
        {/* Tooth outline */}
        <rect
          x="0"
          y="0"
          width="40"
          height="40"
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="1"
        />
        
        {/* Render each surface */}
        {SURFACES.map((surface) => {
          const surfaceColor = getSurfaceColor(toothNumber, surface.id);
          const isSelected = isSurfaceSelected(toothNumber, surface.id);
          
          return (
            <path
              key={`${toothKey}-${surface.id}`}
              d={surface.path}
              fill={surfaceColor}
              stroke={isSelected ? '#3b82f6' : '#d4d4d8'}
              strokeWidth={isSelected ? '2' : '0.5'}
              className={cn(
                'transition-all',
                !readonly && 'cursor-pointer hover:opacity-80'
              )}
              onClick={() => !readonly && onToothClick(toothNumber, surface.id)}
            />
          );
        })}
        
        {/* Tooth number label */}
        <text
          x="20"
          y="48"
          textAnchor="middle"
          fontSize="10"
          fill="#71717a"
          className="select-none"
        >
          {toothNumber}
        </text>
      </g>
    );
  };

  // Render a quadrant
  const renderQuadrant = (
    toothList: ToothNumber[],
    yOffset: number,
    label: string
  ) => {
    return (
      <g transform={`translate(0, ${yOffset})`}>
        <text
          x="-30"
          y="25"
          textAnchor="middle"
          fontSize="12"
          fill="#52525b"
          fontWeight="bold"
          className="select-none"
        >
          {label}
        </text>
        {toothList.map((tooth, idx) => renderTooth(tooth, idx))}
      </g>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="-50 0 900 280"
        className="w-full h-auto"
        style={{ minWidth: '800px' }}
      >
        {/* Upper arch */}
        <g>
          {/* Upper Right */}
          {renderQuadrant(teeth.upperRight, 10, 'UR')}
          
          {/* Upper Left */}
          <g transform={`translate(${teeth.upperRight.length * 50 + 20}, 0)`}>
            {renderQuadrant(teeth.upperLeft, 10, 'UL')}
          </g>
        </g>

        {/* Midline separator */}
        <line
          x1={teeth.upperRight.length * 50 + 10}
          y1="0"
          x2={teeth.upperRight.length * 50 + 10}
          y2="280"
          stroke="#a1a1aa"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Lower arch */}
        <g>
          {/* Lower Right */}
          {renderQuadrant(teeth.lowerRight, 140, 'LR')}
          
          {/* Lower Left */}
          <g transform={`translate(${teeth.lowerRight.length * 50 + 20}, 0)`}>
            {renderQuadrant(teeth.lowerLeft, 140, 'LL')}
          </g>
        </g>

        {/* Arch divider */}
        <line
          x1="-40"
          y1="130"
          x2={
            (teeth.upperRight.length + teeth.upperLeft.length) * 50 + 40
          }
          y2="130"
          stroke="#a1a1aa"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  );
}
