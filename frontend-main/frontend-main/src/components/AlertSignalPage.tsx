import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "./AlertSignalPage.css"

interface WHOEvent {
  id: string
  country: string
  lat: number
  lon: number
  disease: string
  grade: string
  eventType: string
  status: string
  description: string
  year: number
  reportDate: string
  cases?: number
  deaths?: number
  protracted?: string
}

export default function AlertSignalPage() {
  const [events, setEvents] = useState<WHOEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/who-data")
      .then(res => {
        if (!res.ok) throw new Error("API error: " + res.status)
        return res.json()
      })
      .then(data => {
        setEvents(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const alertSignalEvents = events.filter(
    e => e.eventType === "Signal" || e.eventType === "PHE"
  )

  return (
    <div>
      <h2>MR4 Alerts & Signals</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="alertsignal-error">Error: {error}</div>}
      {!loading && !error && (
        <>
          <div>Events loaded: {alertSignalEvents.length}</div>
          <MapContainer center={[0, 0]} zoom={2} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {alertSignalEvents.map(event => (
              <Marker key={event.id} position={[event.lat, event.lon]}>
                <Popup>
                  <strong>{event.disease}</strong><br />
                  {event.country}<br />
                  Grade: {event.grade}<br />
                  Status: {event.status}<br />
                  Cases: {event.cases ?? "N/A"}<br />
                  Deaths: {event.deaths ?? "N/A"}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <h3>Event List</h3>
          <ul>
            {alertSignalEvents.map(event => (
              <li key={event.id}>
                <strong>{event.disease}</strong> ({event.country}) - {event.year} - {event.status}
              </li>
            ))}
          </ul>
        </>
      )}
      {/* Always render something for debugging */}
      <div className="alertsignal-debug-info">Component rendered at {new Date().toLocaleTimeString()}</div>
    </div>
  )
}