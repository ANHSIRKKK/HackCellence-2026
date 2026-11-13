const API_BASE = '/api';

export async function generatePackage(reqBody) {
  const res = await fetch(`${API_BASE}/packages/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody)
  });
  return res.json();
}

export async function fetchFlights({ from, to, cabin, airline } = {}) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (cabin) params.set('cabin', cabin);
  if (airline) params.set('airline', airline);

  const res = await fetch(`${API_BASE}/catalog/flights?${params.toString()}`);
  return res.json();
}

export async function fetchHotels(city) {
  let endpoint = `${API_BASE}/catalog/hotels`;
  if (city && city !== 'all') {
    endpoint += `?city=${encodeURIComponent(city)}`;
  }
  const res = await fetch(endpoint);
  return res.json();
}

export async function fetchAttractions({ city, category } = {}) {
  const params = new URLSearchParams();
  if (city && city !== 'all') params.set('city', city);
  if (category && category !== 'all') params.set('category', category);

  const res = await fetch(`${API_BASE}/catalog/attractions?${params.toString()}`);
  return res.json();
}

export async function fetchTransfers(city) {
  let endpoint = `${API_BASE}/catalog/transfers`;
  if (city) endpoint += `?city=${encodeURIComponent(city)}`;
  const res = await fetch(endpoint);
  return res.json();
}

export async function confirmBooking(tripData) {
  const res = await fetch(`${API_BASE}/bookings/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip: tripData, package: tripData })
  });
  return res.json();
}

export async function fetchBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  return res.json();
}

export async function cancelBooking(reference) {
  const res = await fetch(`${API_BASE}/bookings/${reference}`, {
    method: 'DELETE'
  });
  return res.json();
}

