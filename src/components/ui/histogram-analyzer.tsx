"use client"

import { useState, useMemo, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, RefreshCw } from "lucide-react"

interface HistogramAnalyzerProps {
  dataByDate: {
    date: string
    data: Array<Record<string, any>>
    stats: Record<string, { avg?: number; min?: number; max?: number; std?: number }>
  }
}

export default function HistogramAnalyzer({ dataByDate }: HistogramAnalyzerProps) {

    console
  // Extract columns from first data row keys, exclude "time"
  const columns = useMemo(() => {
    if (!dataByDate || !dataByDate.data || dataByDate.data.length === 0) return []
    return Object.keys(dataByDate.data[0]).filter((col) => col !== "time")
  }, [dataByDate])

  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || "")

  // Reset selected column if columns change and current selection is missing
  useEffect(() => {
    if (columns.length > 0 && !columns.includes(selectedColumn)) {
      setSelectedColumn(columns[0])
    }
  }, [columns, selectedColumn])

  const [binCount, setBinCount] = useState<number>(20)

  // Histogram calculation
  const histogramData = useMemo(() => {
    if (!dataByDate || !dataByDate.data || !selectedColumn) return []

    const values = dataByDate.data
      .map((item) => Number(item[selectedColumn]))
      .filter((v) => !isNaN(v))

    if (values.length === 0) return []

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / binCount || 1

    const bins = Array(binCount)
      .fill(0)
      .map((_, i) => ({
        binStart: min + i * binWidth,
        binEnd: min + (i + 1) * binWidth,
        count: 0,
        values: [] as number[],
      }))

    values.forEach((value) => {
      const idx = Math.min(Math.floor((value - min) / binWidth), binCount - 1)
      bins[idx].count++
      bins[idx].values.push(value)
    })

    return bins.map((bin, idx) => ({
      name: `${bin.binStart.toFixed(2)} - ${bin.binEnd.toFixed(2)}`,
      count: bin.count,
      binIndex: idx,
      binStart: bin.binStart,
      binEnd: bin.binEnd,
      values: bin.values,
    }))
  }, [dataByDate, selectedColumn, binCount])

  // Zoom state
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: number | null
    refAreaRight: number | null
    dataMin: number
    dataMax: number
  }>({
    refAreaLeft: null,
    refAreaRight: null,
    dataMin: 0,
    dataMax: 0,
  })

  // Reset zoom when selectedColumn or data changes
  useEffect(() => {
    if (!dataByDate || !dataByDate.data || !selectedColumn) return

    const values = dataByDate.data
      .map((item) => Number(item[selectedColumn]))
      .filter((v) => !isNaN(v))

    if (values.length === 0) return

    const min = Math.min(...values)
    const max = Math.max(...values)

    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      dataMin: min,
      dataMax: max,
    })
  }, [dataByDate, selectedColumn])

  // Stats from backend
  const statistics = useMemo(() => {
    if (!dataByDate || !dataByDate.stats || !selectedColumn) return null
    return dataByDate.stats[selectedColumn] || null
  }, [dataByDate, selectedColumn])

  // Zoom handlers
  const handleZoomStart = (e: any) => {
    if (!e) return
    setZoomState((prev) => ({
      ...prev,
      refAreaLeft: e.activeLabel,
    }))
  }

  const handleZoomMove = (e: any) => {
    if (!e || zoomState.refAreaLeft === null) return
    setZoomState((prev) => ({
      ...prev,
      refAreaRight: e.activeLabel,
    }))
  }

  const handleZoomEnd = () => {
    if (zoomState.refAreaLeft === null || zoomState.refAreaRight === null) {
      setZoomState((prev) => ({
        ...prev,
        refAreaLeft: null,
        refAreaRight: null,
      }))
      return
    }

    let left = Number(zoomState.refAreaLeft)
    let right = Number(zoomState.refAreaRight)
    if (left > right) [left, right] = [right, left]

    const selectedBins = histogramData.slice(left, right + 1)
    const minValue = selectedBins[0]?.binStart ?? 0
    const maxValue = selectedBins[selectedBins.length - 1]?.binEnd ?? 0

    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      dataMin: minValue,
      dataMax: maxValue,
    })
  }

  const handleResetZoom = () => {
    if (!dataByDate || !dataByDate.data || !selectedColumn) return

    const values = dataByDate.data
      .map((item) => Number(item[selectedColumn]))
      .filter((v) => !isNaN(v))

    if (values.length === 0) return

    const min = Math.min(...values)
    const max = Math.max(...values)

    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      dataMin: min,
      dataMax: max,
    })
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const bin = payload[0].payload
      const totalCount = histogramData.reduce((acc, item) => acc + item.count, 0)
      return (
        <div className="rounded-md bg-white p-3 shadow-md dark:bg-gray-800">
          <p className="mb-1 font-medium">Rango: {bin.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Conteo: {bin.count}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {(bin.count / totalCount * 100).toFixed(2)}% del total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar columna para analizar
          </label>
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar columna" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de intervalos: {binCount}
          </label>
          <Slider
            value={[binCount]}
            min={5}
            max={50}
            step={1}
            onValueChange={(value) => setBinCount(value[0])}
            className="py-4"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleResetZoom} title="Restablecer zoom">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Info className="h-3 w-3" />
            {histogramData.reduce((acc, item) => acc + item.count, 0)} valores
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="histogram" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="histogram">Histograma</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="histogram" className="pt-4">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogramData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseDown={handleZoomStart}
                onMouseMove={handleZoomMove}
                onMouseUp={handleZoomEnd}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="binIndex"
                  tickFormatter={(value) => {
                    const bin = histogramData[value]
                    return bin ? bin.binStart.toFixed(1) : ""
                  }}
                  label={{
                    value: selectedColumn,
                    position: "insideBottom",
                    offset: -10,
                    fill: "#666",
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  domain={[zoomState.dataMin, zoomState.dataMax]}
                  type="number"
                />
                <YAxis
                  label={{
                    value: "Frecuencia",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#666",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Frecuencia" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Brush
                  dataKey="binIndex"
                  height={30}
                  stroke="#10b981"
                  tickFormatter={(value) => {
                    const bin = histogramData[value]
                    return bin ? bin.binStart.toFixed(1) : ""
                  }}
                />
                {zoomState.refAreaLeft !== null && zoomState.refAreaRight !== null ? (
                  <ReferenceArea
                    x1={zoomState.refAreaLeft}
                    x2={zoomState.refAreaRight}
                    strokeOpacity={0.3}
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Haz clic y arrastra para hacer zoom en una región específica
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="pt-4">
          {statistics ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Medidas centrales</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Media</dt>
                      <dd className="font-medium">{statistics.avg?.toFixed(4)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dispersión</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Desviación estándar</dt>
                      <dd className="font-medium">{statistics.std?.toFixed(4)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Valores extremos</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Mínimo</dt>
                      <dd className="font-medium">{statistics.min?.toFixed(4)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Máximo</dt>
                      <dd className="font-medium">{statistics.max?.toFixed(4)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>No hay estadísticas para la columna seleccionada.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
