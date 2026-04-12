import { useRef, useEffect, useState, useMemo } from 'react'
import Globe from 'react-globe.gl'

const CATEGORY_COLORS = {
  SALUD:      '#E63946',
  FAMILIA:    '#F4A261',
  ESPIRITUAL: '#F5C26B',
  TRABAJO:    '#2A9D8F',
  OTROS:      '#A8A8B3',
}

// Rounding precision ≈ 0.1° ≈ 11km per cell — keeps nearby prayers
// under a single bar so they never z-fight on the globe.
const CELL_PRECISION = 1

function cellKey(lat, lng) {
  const f = 10 ** CELL_PRECISION
  return `${Math.round(lat * f) / f},${Math.round(lng * f) / f}`
}

export default function PrayerGlobe({ requests, onSelect }) {
  const globeRef = useRef()
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.4
      globeRef.current.pointOfView({ altitude: 2.5 }, 0)
    }
  }, [])

  // Group prayers that share a cell into a single bar. Altitude stacks the
  // prayer counts; color picks the dominant category in the cell.
  const points = useMemo(() => {
    const groups = new Map()
    for (const r of requests) {
      if (r.latitude == null || r.longitude == null) continue
      const key = cellKey(r.latitude, r.longitude)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(r)
    }

    return Array.from(groups.values()).map(group => {
      const lat = group.reduce((s, r) => s + r.latitude, 0) / group.length
      const lng = group.reduce((s, r) => s + r.longitude, 0) / group.length
      const totalPrayers = group.reduce((s, r) => s + r.prayerCount, 0)

      // Dominant category = most entries; ties broken by total prayers in that category.
      const stats = {}
      for (const r of group) {
        const s = stats[r.category] ?? { count: 0, prayers: 0 }
        s.count += 1
        s.prayers += r.prayerCount
        stats[r.category] = s
      }
      const dominant = Object.entries(stats).sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count
        return b[1].prayers - a[1].prayers
      })[0][0]

      const label = group.length === 1
        ? `${group[0].anonymous ? 'Anónimo' : group[0].authorName} · ${group[0].country}`
        : `${group.length} peticiones · ${group[0].country}`

      return {
        lat,
        lng,
        altitude: Math.max(0.1, totalPrayers * 0.05),
        radius: group.length > 1 ? 0.7 : 0.5,
        color: CATEGORY_COLORS[dominant] ?? CATEGORY_COLORS.OTROS,
        label,
        data: group,
      }
    })
  }, [requests])

  return (
    <Globe
      ref={globeRef}
      width={size.w}
      height={size.h}
      backgroundColor="rgba(0,0,0,0)"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      atmosphereColor="#3a7bd5"
      atmosphereAltitude={0.15}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointAltitude="altitude"
      pointRadius="radius"
      pointColor="color"
      pointLabel="label"
      onPointClick={d => onSelect(d.data)}
    />
  )
}
