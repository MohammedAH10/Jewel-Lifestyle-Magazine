import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { motion } from 'framer-motion'
import {
  Loader2, Shield, Smartphone, Monitor, CheckCircle, XCircle,
  Clock, Trash2, AlertTriangle, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react'

export default function DevicesAdmin() {
  const [devices, setDevices] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequests, setShowRequests] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [devicesData, requestsData] = await Promise.all([
        api.get('/devices/list'),
        api.get('/devices/requests'),
      ])
      setDevices(devicesData)
      setRequests(requestsData)
    } catch (err) {
      console.error('Failed to load devices', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleRemove = async (deviceId) => {
    if (!confirm('Remove this device? It will need re-approval to access the admin panel.')) return
    await api.post(`/devices/remove/${deviceId}`)
    fetchData()
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString() } catch { return d }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-white/60">Manage admin devices. Maximum 2 active secondary devices allowed.</p>

      <div className="flex gap-3">
        <button
          onClick={() => setShowRequests(false)}
          className={`px-4 py-2 text-sm rounded transition-colors ${!showRequests ? 'bg-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
          Devices ({devices.length})
        </button>
        <button
          onClick={() => setShowRequests(true)}
          className={`px-4 py-2 text-sm rounded transition-colors ${showRequests ? 'bg-gold text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
          Pending Requests ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm rounded bg-white/5 text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {showRequests ? (
        <div className="bg-black border border-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Device ID</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">User Agent</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">IP</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-white/50">No requests</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id || req.id} className="border-b border-gold/10 hover:bg-gold/5">
                      <td className="px-6 py-4 text-white/70 text-sm font-mono max-w-[200px] truncate">{req.device_id}</td>
                      <td className="px-6 py-4 text-white/60 text-sm max-w-[250px] truncate">{req.user_agent || '—'}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">{req.ip_address || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {req.status === 'pending' && <Clock size={12} />}
                          {req.status === 'approved' && <CheckCircle size={12} />}
                          {req.status === 'rejected' && <XCircle size={12} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50 text-sm">{formatDate(req.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-black border border-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Device</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">ID</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Role</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Last Seen</th>
                  <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/50">No devices registered</td></tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device._id || device.id} className="border-b border-gold/10 hover:bg-gold/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${device.is_primary ? 'bg-gold/20 text-gold' : device.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                            {device.is_primary ? <Shield size={16} /> : <Monitor size={16} />}
                          </div>
                          <span className="text-white text-sm">{device.device_name || 'Unnamed Device'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/50 text-sm font-mono max-w-[180px] truncate">{device.device_id}</td>
                      <td className="px-6 py-4">
                        {device.is_primary ? (
                          <span className="text-gold text-sm font-medium">Primary</span>
                        ) : (
                          <span className="text-white/50 text-sm">Secondary</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          device.approved && device.is_active ? 'bg-green-500/20 text-green-400' :
                          device.approved ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {device.approved && device.is_active ? <CheckCircle size={12} /> : device.approved ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                          {device.approved && device.is_active ? 'Active' : device.approved ? 'Inactive' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50 text-sm">{formatDate(device.last_seen)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          {!device.is_primary && (
                            <button
                              onClick={() => handleRemove(device.device_id)}
                              className="text-white/40 hover:text-red-400 transition-colors p-1"
                              title="Remove device"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {device.is_primary && (
                            <span className="text-white/20 text-xs px-2">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
