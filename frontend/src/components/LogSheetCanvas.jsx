import { useRef, useEffect } from 'react'

const HEADER_HEIGHT = 24
const ROW_HEIGHT = 36
const LABEL_WIDTH = 100
const HOUR_WIDTH = 28
const GRID_WIDTH = 24 * HOUR_WIDTH

const DUTY_STATUS = [
    { key: 'offDuty', label: 'Off Duty', shortLabel: '1', color: '#16a34a' },
    { key: 'sleeperBerth', label: 'Sleeper', shortLabel: '2', color: '#4f46e5' },
    { key: 'driving', label: 'Driving', shortLabel: '3', color: '#2563eb' },
    { key: 'onDuty', label: 'On Duty', shortLabel: '4', color: '#ea580c' },
]

function LogSheetCanvas({ log, day, date, stops = [], totalMiles = 0 }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1

        const width = LABEL_WIDTH + GRID_WIDTH + 10
        const height = HEADER_HEIGHT + (4 * ROW_HEIGHT) + 10

        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(dpr, dpr)

        // Clear
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        drawGrid(ctx, width, height)

        if (log) {
            drawDutyLines(ctx, log)
        }
    }, [log, day, date])

    const drawGrid = (ctx, width, height) => {
        const gridStartX = LABEL_WIDTH
        const gridStartY = HEADER_HEIGHT

        // Hour labels
        ctx.fillStyle = '#64748b'
        ctx.font = '10px Inter, sans-serif'
        ctx.textAlign = 'center'

        for (let h = 0; h <= 24; h++) {
            const x = gridStartX + (h * HOUR_WIDTH)

            if (h === 0 || h === 24) {
                ctx.fillText('M', x, 14)
            } else if (h === 12) {
                ctx.fillText('N', x, 14)
            } else {
                ctx.fillText(h.toString(), x, 14)
            }

            // Vertical lines
            ctx.strokeStyle = h % 6 === 0 ? '#94a3b8' : '#e2e8f0'
            ctx.lineWidth = h % 6 === 0 ? 1 : 0.5
            ctx.beginPath()
            ctx.moveTo(x, gridStartY)
            ctx.lineTo(x, gridStartY + (4 * ROW_HEIGHT))
            ctx.stroke()

            // Quarter hour marks
            if (h < 24) {
                ctx.strokeStyle = '#f1f5f9'
                ctx.lineWidth = 0.5
                for (let q = 1; q < 4; q++) {
                    const qx = x + (q * HOUR_WIDTH / 4)
                    ctx.beginPath()
                    ctx.moveTo(qx, gridStartY)
                    ctx.lineTo(qx, gridStartY + (4 * ROW_HEIGHT))
                    ctx.stroke()
                }
            }
        }

        // Row labels
        ctx.textAlign = 'left'
        ctx.font = '11px Inter, sans-serif'

        DUTY_STATUS.forEach((status, index) => {
            const y = gridStartY + (index * ROW_HEIGHT)

            // Row number
            ctx.fillStyle = '#94a3b8'
            ctx.fillText(status.shortLabel + '.', 8, y + 22)

            // Row label
            ctx.fillStyle = status.color
            ctx.fillText(status.label, 22, y + 22)

            // Horizontal line
            ctx.strokeStyle = '#cbd5e1'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(gridStartX, y + ROW_HEIGHT)
            ctx.lineTo(gridStartX + GRID_WIDTH, y + ROW_HEIGHT)
            ctx.stroke()
        })

        // Border
        ctx.strokeStyle = '#64748b'
        ctx.lineWidth = 1.5
        ctx.strokeRect(gridStartX, gridStartY, GRID_WIDTH, 4 * ROW_HEIGHT)
    }

    const drawDutyLines = (ctx, logData) => {
        const gridStartX = LABEL_WIDTH
        const gridStartY = HEADER_HEIGHT

        DUTY_STATUS.forEach((status, rowIndex) => {
            const segments = logData[status.key] || []
            const y = gridStartY + (rowIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2)

            ctx.strokeStyle = status.color
            ctx.lineWidth = 4
            ctx.lineCap = 'round'

            segments.forEach(segment => {
                const startX = gridStartX + (segment.start * HOUR_WIDTH)
                const endX = gridStartX + (segment.end * HOUR_WIDTH)
                ctx.beginPath()
                ctx.moveTo(startX, y)
                ctx.lineTo(endX, y)
                ctx.stroke()
            })
        })

        // Vertical transitions
        const allSegments = []
        DUTY_STATUS.forEach((status, rowIndex) => {
            const segments = logData[status.key] || []
            segments.forEach(seg => {
                allSegments.push({ ...seg, rowIndex })
            })
        })
        allSegments.sort((a, b) => a.start - b.start)

        ctx.strokeStyle = '#475569'
        ctx.lineWidth = 2

        for (let i = 0; i < allSegments.length - 1; i++) {
            const current = allSegments[i]
            const next = allSegments[i + 1]

            if (Math.abs(current.end - next.start) < 0.1) {
                const x = gridStartX + (current.end * HOUR_WIDTH)
                const y1 = gridStartY + (current.rowIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2)
                const y2 = gridStartY + (next.rowIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2)
                ctx.beginPath()
                ctx.moveTo(x, y1)
                ctx.lineTo(x, y2)
                ctx.stroke()
            }
        }
    }

    // Generate remarks from stops
    const generateRemarks = () => {
        if (!stops || stops.length === 0) return []

        return stops
            .filter(stop => stop.type !== 'driving')
            .map(stop => {
                const time = stop.time || stop.startTime || ''
                const location = stop.location || ''
                let action = ''

                switch (stop.type) {
                    case 'start': action = 'Start duty'; break
                    case 'pickup': action = 'Pickup - Loading'; break
                    case 'dropoff': action = 'Dropoff - Unloading'; break
                    case 'fuel': action = 'Fuel stop'; break
                    case 'break': action = '30-min break'; break
                    case 'rest': action = '10-hour rest'; break
                    case 'end': action = 'End duty'; break
                    default: action = stop.type
                }

                return { time, location, action, mileage: stop.mileage }
            })
    }

    const remarks = generateRemarks()

    return (
        <div className="space-y-4">
            {/* Log Header */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 text-sm">Driver's Daily Log</h3>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                        <span className="text-slate-500 text-xs block">Date</span>
                        <span className="font-medium text-slate-900">{date || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-xs block">24-Hour Period</span>
                        <span className="font-medium text-slate-900">Midnight to Midnight</span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-xs block">Day</span>
                        <span className="font-medium text-slate-900">{day || 1}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 text-xs block">Total Miles Today</span>
                        <span className="font-medium text-slate-900">{totalMiles.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Graph Grid */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 text-sm">Graph Grid — Record of Duty Status</h3>
                </div>
                <div className="p-3 overflow-x-auto bg-white">
                    <canvas ref={canvasRef} />
                </div>
                {/* Color Legend */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                    <div className="flex flex-wrap gap-4 justify-center text-xs">
                        {DUTY_STATUS.map(status => (
                            <div key={status.key} className="flex items-center gap-1.5">
                                <span
                                    className="w-4 h-1 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                />
                                <span className="text-slate-600">{status.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Totals */}
            {log?.totals && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900 text-sm">Total Hours</h3>
                    </div>
                    <div className="p-3 grid grid-cols-4 gap-2">
                        {DUTY_STATUS.map(status => (
                            <div
                                key={status.key}
                                className="text-center p-2 rounded border"
                                style={{
                                    backgroundColor: `${status.color}08`,
                                    borderColor: `${status.color}30`
                                }}
                            >
                                <p className="text-lg font-bold" style={{ color: status.color }}>
                                    {log.totals[status.key]}
                                </p>
                                <p className="text-xs text-slate-600">{status.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
                        Total: {Object.values(log.totals).reduce((a, b) => a + b, 0)} hours (must equal 24)
                    </div>
                </div>
            )}

            {/* Remarks Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900 text-sm">Remarks — Locations & Duty Changes</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {remarks.length > 0 ? (
                        remarks.map((remark, index) => (
                            <div key={index} className="px-4 py-2.5 flex items-start gap-3 text-sm">
                                <span className="font-mono text-slate-500 text-xs w-12 flex-shrink-0 pt-0.5">
                                    {remark.time}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium text-slate-900">{remark.location}</span>
                                    <span className="text-slate-400 mx-2">—</span>
                                    <span className="text-slate-600">{remark.action}</span>
                                </div>
                                {remark.mileage !== undefined && (
                                    <span className="text-xs text-slate-400 flex-shrink-0">
                                        Mi {remark.mileage.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 italic">
                            No stops recorded for this day
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LogSheetCanvas
