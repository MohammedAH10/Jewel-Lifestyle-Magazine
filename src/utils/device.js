const DEVICE_UUID_KEY = 'jewel_device_uuid'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getDeviceUUID() {
  let uuid = localStorage.getItem(DEVICE_UUID_KEY)
  if (!uuid) {
    uuid = generateUUID()
    localStorage.setItem(DEVICE_UUID_KEY, uuid)
  }
  return uuid
}

export function getDeviceName() {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown Browser'
}

export function getDeviceHeaders() {
  return {
    'x-device-uuid': getDeviceUUID(),
    'x-device-name': getDeviceName(),
  }
}
