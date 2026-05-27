import { useEffect, useState, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  scale: number
  opacity: number
}

interface CoinEffectProps {
  active: boolean
}

export function CoinEffect({ active }: CoinEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const rafRef = useRef<number>(0)
  const countRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    countRef.current = 0
    const newParticles: Particle[] = []

    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 30,
        y: 45,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        scale: 0.6 + Math.random() * 0.6,
        opacity: 1,
      })
    }

    setParticles(newParticles)
  }, [active])

  useEffect(() => {
    if (particles.length === 0) return

    const animate = () => {
      setParticles(prev => {
        const next = prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.3,
          y: p.y + p.vy * 0.3,
          vy: p.vy + 0.3,
          rotation: p.rotation + p.rotationSpeed,
          opacity: Math.max(0, p.opacity - 0.008),
        })).filter(p => p.opacity > 0 && p.y < 110)

        if (next.length > 0) {
          rafRef.current = requestAnimationFrame(animate)
        }
        return next
      })
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [particles.length > 0])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            opacity: p.opacity,
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          🪙
        </div>
      ))}
    </div>
  )
}
