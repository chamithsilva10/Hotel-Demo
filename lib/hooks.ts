import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useRequests() {
  const { data, error, isLoading, mutate } = useSWR('/api/requests', fetcher)

  return {
    requests: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useGuests() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests', fetcher)

  return {
    guests: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR('/api/staff', fetcher)

  return {
    staff: data || [],
    isLoading,
    error,
    mutate,
  }
}

export async function createRequest(requestData: any) {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  })
  if (!response.ok) throw new Error('Failed to create request')
  return response.json()
}

export async function updateRequest(id: number, updates: any) {
  const response = await fetch('/api/requests', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
  if (!response.ok) throw new Error('Failed to update request')
  return response.json()
}

export async function deleteRequest(id: number) {
  const response = await fetch(`/api/requests?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete request')
  return response.json()
}

export async function createGuest(guestData: any) {
  const response = await fetch('/api/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guestData),
  })
  if (!response.ok) throw new Error('Failed to create guest')
  return response.json()
}

export async function updateGuest(id: number, updates: any) {
  const response = await fetch('/api/guests', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
  if (!response.ok) throw new Error('Failed to update guest')
  return response.json()
}

export async function deleteGuest(id: number) {
  const response = await fetch(`/api/guests?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete guest')
  return response.json()
}

export async function createStaff(staffData: any) {
  const response = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData),
  })
  if (!response.ok) throw new Error('Failed to create staff')
  return response.json()
}

export async function updateStaff(id: number, updates: any) {
  const response = await fetch('/api/staff', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
  if (!response.ok) throw new Error('Failed to update staff')
  return response.json()
}

export async function deleteStaff(id: number) {
  const response = await fetch(`/api/staff?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete staff')
  return response.json()
}
