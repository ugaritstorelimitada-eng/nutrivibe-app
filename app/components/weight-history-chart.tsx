'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { TrendingDown, TrendingUp, Minus, Scale, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeightHistoryStore } from '../store/useWeightHistoryStore'
import { useUserStore } from '../store/useUserStore'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { date: string; label: string; weight: number; bmi: number | null } }>
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{data.label}</p>
      <p className="text-primary font-bold">{data.weight.toFixed(1)} kg</p>
      {data.bmi && <p className="text-muted-foreground">IMC {data.bmi.toFixed(1)}</p>}
    </div>
  )
}

export default function WeightHistoryChart() {
  const { entries, addEntry, removeEntry, getChartData, getWeightDelta, getLatestWeight } =
    useWeightHistoryStore()
  const height = useUserStore(s => s.height)
  const [newWeight, setNewWeight] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const chartData = getChartData()
  const delta = getWeightDelta()
  const latestWeight = getLatestWeight()

  // Suggest weight based on last known weight
  useEffect(() => {
    if (latestWeight && !newWeight) {
      setNewWeight(latestWeight.toFixed(1))
    }
  }, [latestWeight])

  const handleAdd = () => {
    const w = parseFloat(newWeight)
    if (!w || w <= 0) return
    const h = height / 100
    const bmi = h > 0 ? Number((w / (h * h)).toFixed(1)) : null
    addEntry(w, bmi)
    setNewWeight(w.toFixed(1))
    setShowAdd(false)
  }

  const handleDeleteEntry = (date: string) => {
    removeEntry(date)
    if (selected === date) setSelected(null)
  }

  const minWeight = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) : 0
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 100
  const domainMin = Math.floor(minWeight - 3)
  const domainMax = Math.ceil(maxWeight + 3)

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Historial de Peso</h3>
        </div>
        <div className="flex items-center gap-2">
          {delta && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              delta.delta < 0
                ? 'bg-green-100 text-green-700'
                : delta.delta > 0
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {delta.delta < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : delta.delta > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {delta.delta > 0 ? '+' : ''}{delta.delta} kg
            </div>
          )}
          <button
            onClick={() => setShowAdd(s => !s)}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Agregar peso"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add entry form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-primary/5 border-b border-primary/10"
          >
            <div className="px-4 py-3 flex items-center gap-2">
              <input
                type="number"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                placeholder="kg"
                step="0.1"
                className="w-24 px-3 py-2 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-xs text-muted-foreground">kg</span>
              <button
                onClick={handleAdd}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="py-10 text-center">
          <Scale className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sin datos aún</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Agrega tu peso para ver la evolución
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            Agregar primer registro
          </button>
        </div>
      ) : (
        <>
          <div className="px-4 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={latestWeight ?? 0}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Entries list */}
          <div className="max-h-40 overflow-y-auto border-t border-border">
            {chartData.slice().reverse().map((entry, i) => (
              <div
                key={entry.date}
                onClick={() => setSelected(selected === entry.date ? null : entry.date)}
                className={`flex items-center justify-between px-4 py-2 text-xs cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/50 last:border-b-0 ${
                  selected === entry.date ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{entry.label}</span>
                  {i === 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      hoy
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{entry.weight.toFixed(1)} kg</span>
                  {entry.bmi && (
                    <span className="text-muted-foreground">IMC {entry.bmi.toFixed(1)}</span>
                  )}
                  {selected === entry.date && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteEntry(entry.date)
                      }}
                      className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
