// ============================================================================
// CLINICAL V2 - TOOTH CHART SVG
// ============================================================================

'use client';

import React from 'react';
import { ToothNumber, ToothSurface } from '../../types';
import { ADULT_TEETH, SURFACES, getFindingById } from '../../constants/dental';
import { useDentalSession } from '../../hooks/use-dental-session';
import { cn } from '@/lib/utils';

interface ToothChartProps {
  onToothClick?: (tooth: ToothNumber, surface: ToothSurface) => void;
}

export function ToothChart({ onToothClick }: ToothChartProps) {
  const { findings, selectedTooth, selectedSurface } = useDentalSession();

  // Helper para obtener el color de una superficie según hallazgos
  const getSurfaceColor = (tooth: ToothNumber, surface: ToothSurface): string => {
    const finding = findings.find(
      (f) => f.toothNumber === tooth && f.surface === surface
    );
    
    if (finding) {
      const definition = getFindingById(finding.findingId);
      return definition?.color || '#e5e7eb'; // gray-200 por defecto
    }
    
    return '#ffffff'; // Blanco si no hay hallazgo
  };

  // Helper para saber si una superficie está seleccionada
  const isSurfaceSelected = (tooth: ToothNumber, surface: ToothSurface): boolean => {
    return selectedTooth === tooth && selectedSurface === surface;
  };

  // Renderizar un diente con sus superficies
  const renderTooth = (tooth: ToothNumber, x: number, y: number) => {
    const toothSize = 40;
    
    return (
      <g key={tooth} transform={`translate(${x}, ${y})`}>
        {/* Fondo del diente */}
        <rect
          x="0"
          y="0"
          width={toothSize}
          height={toothSize}
          fill="#f9fafb"
          stroke="#d1d5db"
          strokeWidth="1"
          rx="4"
        />
        
        {/* Superficies clickeables */}
        {Object.entries(SURFACES).map(([surfaceName, surfaceData]) => {
          if (surfaceName === 'whole') return null; // No renderizar "whole" individualmente
          
          const surface = surfaceName as ToothSurface;
          const color = getSurfaceColor(tooth, surface);
          const isSelected = isSurfaceSelected(tooth, surface);
          
          return (
            <g key={surface}>
              <path
                d={surfaceData.path}
                fill={color}
                stroke={isSelected ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isSelected ? '2' : '0.5'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onToothClick?.(tooth, surface)}
              />
            </g>
          );
        })}
        
        {/* Número del diente */}
        <text
          x={toothSize / 2}
          y={toothSize / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] font-bold fill-gray-700 pointer-events-none"
        >
          {tooth}
        </text>
      </g>
    );
  };

  // Espaciado entre dientes
  const spacing = 45;
  const quadrantWidth = spacing * 8;
  const quadrantGap = 30;
  const centerGap = 20;

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <svg
        viewBox={`0 0 ${quadrantWidth * 2 + centerGap} ${spacing * 4 + quadrantGap}`}
        className="w-full h-auto"
      >
        {/* Arcada Superior */}
        <g>
          {/* Cuadrante Superior Derecho (18-11) */}
          {ADULT_TEETH.upperRight.map((tooth, index) => 
            renderTooth(tooth, index * spacing, 0)
          )}
          
          {/* Línea central vertical */}
          <line
            x1={quadrantWidth + centerGap / 2}
            y1={-10}
            x2={quadrantWidth + centerGap / 2}
            y2={spacing * 4 + quadrantGap + 10}
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Cuadrante Superior Izquierdo (21-28) */}
          {ADULT_TEETH.upperLeft.map((tooth, index) => 
            renderTooth(tooth, quadrantWidth + centerGap + index * spacing, 0)
          )}
        </g>

        {/* Línea horizontal separando arcadas */}
        <line
          x1={-10}
          y1={spacing * 2 + quadrantGap / 2}
          x2={quadrantWidth * 2 + centerGap + 10}
          y2={spacing * 2 + quadrantGap / 2}
          stroke="#9ca3af"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Arcada Inferior */}
        <g transform={`translate(0, ${spacing * 2 + quadrantGap})`}>
          {/* Cuadrante Inferior Izquierdo (31-38) */}
          {ADULT_TEETH.lowerLeft.map((tooth, index) => 
            renderTooth(tooth, quadrantWidth + centerGap + index * spacing, 0)
          )}
          
          {/* Cuadrante Inferior Derecho (41-48) */}
          {ADULT_TEETH.lowerRight.map((tooth, index) => 
            renderTooth(tooth, index * spacing, 0)
          )}
        </g>

        {/* Etiquetas de cuadrantes */}
        <text
          x={quadrantWidth / 2}
          y={-20}
          textAnchor="middle"
          className="text-xs fill-gray-500 font-semibold"
        >
          Superior Derecho
        </text>
        <text
          x={quadrantWidth + centerGap + quadrantWidth / 2}
          y={-20}
          textAnchor="middle"
          className="text-xs fill-gray-500 font-semibold"
        >
          Superior Izquierdo
        </text>
        <text
          x={quadrantWidth / 2}
          y={spacing * 4 + quadrantGap + 55}
          textAnchor="middle"
          className="text-xs fill-gray-500 font-semibold"
        >
          Inferior Derecho
        </text>
        <text
          x={quadrantWidth + centerGap + quadrantWidth / 2}
          y={spacing * 4 + quadrantGap + 55}
          textAnchor="middle"
          className="text-xs fill-gray-500 font-semibold"
        >
          Inferior Izquierdo
        </text>
      </svg>
    </div>
  );
}
