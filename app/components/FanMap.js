'use client'

import { useEffect, useState, memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'

// Country centroids for dot placement
const CENTROIDS = {
  US: [-95.7, 37.1], GB: [-3.2, 54.4], CA: [-96.8, 56.1], AU: [133.8, -25.3],
  DE: [10.5, 51.2], FR: [2.2, 46.2], JP: [138.3, 36.2], BR: [-51.9, -14.2],
  NG: [8.7, 9.1],   GH: [-1.0, 7.9],  ZA: [25.1, -29.0], KE: [37.9, 0.0],
  MX: [-102.5, 23.6], IN: [78.9, 20.6], PH: [121.8, 12.9], JM: [-77.3, 18.1],
  TT: [-61.2, 10.7], IT: [12.6, 41.9], ES: [-3.7, 40.4], NL: [5.3, 52.1],
  SE: [18.6, 59.3],  NO: [8.5, 60.5],  DK: [10.0, 56.3], NZ: [174.9, -40.9],
  SG: [103.8, 1.4],  AE: [53.8, 23.4], NG: [8.7, 9.1],   EG: [30.8, 26.8],
  AR: [-65.2, -34.6], CL: [-71.5, -35.7], CO: [-74.3, 4.6],
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function FanMap({ countries = [] }) {
  const max = Math.max(...countries.map(c => c.count), 1)

  return (
    <div className="fan-map-wrap">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 15] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1a1a1a"
                stroke="#2a2a2a"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover:   { outline: 'none', fill: '#222' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {countries.map(({ country_code, country, count }) => {
          const coords = CENTROIDS[country_code]
          if (!coords) return null
          const r = 4 + (count / max) * 14
          return (
            <Marker key={country_code} coordinates={coords}>
              {/* Pulse ring */}
              <circle r={r + 4} fill="#C4222E" opacity={0.15} />
              {/* Main dot */}
              <circle r={r} fill="#C4222E" opacity={0.85} />
              {/* Tooltip on hover via title */}
              <title>{country}: {count} fan{count !== 1 ? 's' : ''}</title>
            </Marker>
          )
        })}
      </ComposableMap>
    </div>
  )
}

export default memo(FanMap)
