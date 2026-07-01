import useSWR from 'swr'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const fetcher = async (path: string) => {
  const response = await fetch(`${API_BASE_URL}${path}`)
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload?.data ?? payload
}

export function useRequests() {
  const { data, error, isLoading, mutate } = useSWR('/api/requests', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    requests: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  }
}

export function useGuests() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    guests: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  }
}

export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR('/api/staff', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    staff: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  }
}

export async function createRequest(requestData: any) {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to create request')
  return payload.data ?? payload
}

export async function updateRequest(id: number, updates: any) {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to update request')
  return payload.data ?? payload
}

export async function deleteRequest(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: 'DELETE',
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to delete request')
  return payload.data ?? payload
}

export async function createGuest(guestData: any) {
  const response = await fetch(`${API_BASE_URL}/api/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guestData),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to create guest')
  return payload.data ?? payload
}

export async function updateGuest(id: number, updates: any) {
  const response = await fetch(`${API_BASE_URL}/api/guests`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to update guest')
  return payload.data ?? payload
}

export async function deleteGuest(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/guests?id=${id}`, {
    method: 'DELETE',
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to delete guest')
  return payload.data ?? payload
}

export async function createStaff(staffData: any) {
  const response = await fetch(`${API_BASE_URL}/api/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to create staff')
  return payload.data ?? payload
}

export async function updateStaff(id: number, updates: any) {
  const response = await fetch(`${API_BASE_URL}/api/staff`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to update staff')
  return payload.data ?? payload
}

export async function deleteStaff(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/staff?id=${id}`, {
    method: 'DELETE',
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.message || 'Failed to delete staff')
  return payload.data ?? payload
}
