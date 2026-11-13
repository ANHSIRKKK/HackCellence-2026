const catalog = require('./catalog');
const storage = require('./storage');
const planner = require('./planner');

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class ValidatorService {
  getHotelSwapOptions(trip, city) {
    const adults = trip.traveler.adults;
    const children = trip.traveler.children;
    const currentHotelItem = trip.items.find(it => it.type === 'hotel' && it.city === city);
    if (!currentHotelItem) return [];

    const nights = Math.round((new Date(currentHotelItem.end) - new Date(currentHotelItem.start)) / (1000 * 60 * 60 * 24));
    const cityHotels = catalog.hotelsByCity.get(city) || [];
    const options = [];

    for (const htl of cityHotels) {
      const rooms = catalog.roomsByHotel.get(htl.hotel_id) || [];
      for (const rm of rooms) {
        const k = planner.findRoomFit(rm, adults, children);
        if (!k) continue;

        let allNightsAvail = true;
        for (let n = 0; n < nights; n++) {
          const nightDate = addDays(currentHotelItem.start, n);
          const baseLeft = catalog.getRoomAvailability(rm.room_id, nightDate);
          const locked = storage.getLockedRooms(rm.room_id, nightDate);
          if (baseLeft - locked < k) {
            allNightsAvail = false;
            break;
          }
        }

        if (allNightsAvail) {
          const newPrice = rm.price_per_night.amount * k * nights;
          const deltaPrice = newPrice - currentHotelItem.price_inr;
          const isCurrent = (htl.hotel_id === currentHotelItem.catalog_id && rm.room_id === currentHotelItem.room_id);

          options.push({
            hotel_id: htl.hotel_id,
            hotel_name: htl.name,
            area: htl.area,
            stars: htl.stars,
            rating: htl.rating,
            image: htl.image,
            family_friendly: htl.family_friendly,
            room_id: rm.room_id,
            room_name: rm.name,
            room_type: rm.room_type,
            quantity: k,
            price_inr: newPrice,
            delta_price: deltaPrice,
            is_current: isCurrent
          });
        }
      }
    }

    return options.sort((a, b) => a.delta_price - b.delta_price);
  }

  getFlightSwapOptions(trip, direction) { // direction: 'outbound' or 'inbound'
    const totalTravelers = trip.traveler.adults + trip.traveler.children;
    const currentFlight = trip.items.find(it => {
      if (it.type !== 'flight') return false;
      return direction === 'outbound' ? it.start.startsWith(trip.start_date) || it.end.startsWith(trip.start_date) : it.start.startsWith(trip.end_date);
    });

    if (!currentFlight) return [];

    let potentialFlights = [];
    if (direction === 'outbound') {
      const outKey = `${trip.traveler.home_airport}_${trip.start_date}`;
      potentialFlights = catalog.outboundFlights.get(outKey) || [];
    } else {
      const inKey = `${trip.traveler.home_airport}_${trip.end_date}`;
      potentialFlights = catalog.inboundFlights.get(inKey) || [];
    }

    const options = [];
    for (const fl of potentialFlights) {
      const locked = storage.getLockedSeats(fl.flight_id);
      if (fl.seats_left - locked < totalTravelers) continue;

      const newPrice = fl.price_per_seat.amount * totalTravelers;
      const deltaPrice = newPrice - currentFlight.price_inr;
      const isCurrent = fl.flight_id === currentFlight.catalog_id;

      options.push({
        flight_id: fl.flight_id,
        airline: fl.airline,
        flight_number: fl.flight_number,
        from: fl.from,
        to: fl.to,
        departure_local: fl.departure_local,
        arrival_local: fl.arrival_local,
        stops: fl.stops,
        duration_minutes: fl.duration_minutes,
        seats_left: fl.seats_left - locked,
        price_inr: newPrice,
        delta_price: deltaPrice,
        is_current: isCurrent
      });
    }

    return options.sort((a, b) => a.delta_price - b.delta_price);
  }

  getAttractionSwapOptions(trip, targetDate) {
    const adults = trip.traveler.adults;
    const children = trip.traveler.children;

    // Find city for this date
    const hotelItem = trip.items.find(it => it.type === 'hotel' && targetDate >= it.start && targetDate < it.end);
    if (!hotelItem) return [];

    const city = hotelItem.city;
    const dayAttractions = catalog.attractionsByCity.get(city) || [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const d = new Date(targetDate + 'T00:00:00');
    const dayOfWeek = days[d.getDay()];

    const scheduledIds = new Set(trip.items.filter(it => it.type === 'attraction').map(it => it.catalog_id));

    const options = [];
    for (const att of dayAttractions) {
      if (!att.open_days.includes(dayOfWeek)) continue;
      if (att.closed_dates && att.closed_dates.includes(targetDate)) continue;

      const cost = planner.calculateAttractionCost(att, adults, children);
      const isScheduled = scheduledIds.has(att.attraction_id);

      options.push({
        attraction_id: att.attraction_id,
        name: att.name,
        name_ja: att.name_ja,
        category: att.category,
        city: att.city,
        open_from: att.open_from,
        open_until: att.open_until,
        visit_minutes: att.visit_minutes,
        child_friendly: att.child_friendly,
        accessible: att.accessible,
        image: att.image,
        price_inr: cost,
        is_scheduled: isScheduled
      });
    }

    return options;
  }

  recalculateAndValidateTrip(trip) {
    const warnings = [];
    const items = trip.items;

    // Recalculate total price
    const newTotal = items.reduce((sum, it) => sum + it.price_inr, 0);
    trip.total_inr = newTotal;

    // Check budget limit
    if (newTotal > trip.budget_inr) {
      warnings.push(`Package total (₹${newTotal.toLocaleString('en-IN')}) exceeds your budget by ₹${(newTotal - trip.budget_inr).toLocaleString('en-IN')}.`);
    }

    // Check Flight arrival vs Transfer buffer (Feature G1)
    const outFlight = items.find(it => it.type === 'flight' && it.city !== trip.traveler.home_airport);
    const arrTransfer = items.find(it => it.type === 'transfer' && it.start.startsWith(trip.start_date));
    if (outFlight && arrTransfer) {
      const flArrMins = new Date(outFlight.end).getHours() * 60 + new Date(outFlight.end).getMinutes();
      const trPickMins = new Date(arrTransfer.start).getHours() * 60 + new Date(arrTransfer.start).getMinutes();
      if (trPickMins - flArrMins < 60) {
        warnings.push(`Warning: Airport transfer pickup is less than 60 minutes after flight arrival. We recommend at least 60 minutes.`);
      }
    }

    // Check Departure Transfer vs Flight departure buffer (Feature G1)
    const inFlight = items.find(it => it.type === 'flight' && it.city === trip.traveler.home_airport);
    const depTransfer = items.find(it => it.type === 'transfer' && it.start.startsWith(trip.end_date));
    if (inFlight && depTransfer) {
      const flDepMins = new Date(inFlight.start).getHours() * 60 + new Date(inFlight.start).getMinutes();
      const trReachMins = new Date(depTransfer.end).getHours() * 60 + new Date(depTransfer.end).getMinutes();
      if (flDepMins - trReachMins < 180) {
        warnings.push(`Warning: Airport arrival is less than 180 minutes before departure. International flights require 3 hours.`);
      }
    }

    // Check Attraction non-overlapping on same day
    const attractions = items.filter(it => it.type === 'attraction');
    const attByDate = {};
    for (const att of attractions) {
      const date = att.start.split('T')[0];
      if (!attByDate[date]) attByDate[date] = [];
      attByDate[date].push(att);
    }

    for (const [date, attList] of Object.entries(attByDate)) {
      attList.sort((a, b) => new Date(a.start) - new Date(b.start));
      for (let i = 0; i < attList.length - 1; i++) {
        if (new Date(attList[i].end) > new Date(attList[i + 1].start)) {
          warnings.push(`Overlap detected on ${date}: ${attList[i].name} ends after ${attList[i + 1].name} starts.`);
        }
      }
    }

    return {
      valid: true,
      warnings,
      updated_trip: trip
    };
  }
}

module.exports = new ValidatorService();
