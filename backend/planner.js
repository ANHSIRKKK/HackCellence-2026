const catalog = require('./catalog');
const storage = require('./storage');

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTime(timeStr) {
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function formatMinutesToTime(totalMins) {
  const norm = ((totalMins % 1440) + 1440) % 1440;
  const h = String(Math.floor(norm / 60)).padStart(2, '0');
  const m = String(norm % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function isTimeInWindow(timeMins, fromMins, untilMins) {
  if (fromMins <= untilMins) {
    return timeMins >= fromMins && timeMins <= untilMins;
  } else {
    // Crosses midnight, e.g. 06:00 to 00:30
    return timeMins >= fromMins || timeMins <= untilMins;
  }
}

function getDayOfWeek(dateStr) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return days[dt.getDay()];
}

class PlannerService {
  findRoomFit(room, adults, children) {
    const totalTravelers = adults + children;
    const k1 = Math.ceil(adults / room.max_adults);
    const k2 = Math.ceil(totalTravelers / (room.max_adults + room.max_children));
    const kMin = Math.max(1, k1, k2);

    if (adults >= kMin) {
      return kMin;
    }
    return null;
  }

  calculateTransferCost(transfer, adults, children) {
    const totalTravelers = adults + children;
    if (transfer.pricing === 'PER_VEHICLE') {
      const vehicles = Math.ceil(totalTravelers / (transfer.max_passengers || 4));
      return {
        vehicles,
        cost: vehicles * transfer.price.amount
      };
    } else {
      const childRate = transfer.child_price ? transfer.child_price.amount : transfer.price.amount;
      const cost = adults * transfer.price.amount + children * childRate;
      return {
        vehicles: 1,
        cost
      };
    }
  }

  calculateAttractionCost(attraction, adults, children) {
    const adultRate = attraction.price_per_person.amount;
    const childRate = attraction.child_price ? attraction.child_price.amount : adultRate;
    return adults * adultRate + children * childRate;
  }

  generateCityPlans(countryName, totalNights) {
    const country = catalog.destinations.countries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (!country) return [];

    const cityNames = country.cities.map(c => c.name);
    const minNights = catalog.destinations.rules.min_nights_per_city || 2;
    const plans = [];

    const hasLink = (c1, c2) => country.links.some(l => l.from_city === c1 && l.to_city === c2);

    // 1 City Plans
    for (const c of cityNames) {
      if (totalNights >= minNights) {
        plans.push([{ city: c, nights: totalNights }]);
      }
    }

    // 2 City Plans
    for (const c1 of cityNames) {
      for (const c2 of cityNames) {
        if (c1 !== c2 && hasLink(c1, c2)) {
          for (let n1 = minNights; n1 <= totalNights - minNights; n1++) {
            const n2 = totalNights - n1;
            if (n2 >= minNights) {
              plans.push([
                { city: c1, nights: n1 },
                { city: c2, nights: n2 }
              ]);
            }
          }
        }
      }
    }

    // 3 City Plans
    if (totalNights >= 6 && cityNames.length >= 3) {
      for (const c1 of cityNames) {
        for (const c2 of cityNames) {
          for (const c3 of cityNames) {
            if (c1 !== c2 && c2 !== c3 && c1 !== c3 && hasLink(c1, c2) && hasLink(c2, c3)) {
              for (let n1 = minNights; n1 <= totalNights - 2 * minNights; n1++) {
                for (let n2 = minNights; n2 <= totalNights - n1 - minNights; n2++) {
                  const n3 = totalNights - n1 - n2;
                  if (n3 >= minNights) {
                    plans.push([
                      { city: c1, nights: n1 },
                      { city: c2, nights: n2 },
                      { city: c3, nights: n3 }
                    ]);
                  }
                }
              }
            }
          }
        }
      }
    }

    return plans;
  }

  getValidHotelOptionsForCity(city, checkInDate, nights, adults, children) {
    const hotels = catalog.hotelsByCity.get(city) || [];
    const options = [];

    for (const htl of hotels) {
      const rooms = catalog.roomsByHotel.get(htl.hotel_id) || [];
      for (const rm of rooms) {
        const k = this.findRoomFit(rm, adults, children);
        if (!k) continue;

        let available = true;
        for (let n = 0; n < nights; n++) {
          const dateStr = addDays(checkInDate, n);
          const baseAvail = catalog.getRoomAvailability(rm.room_id, dateStr);
          const locked = storage.getLockedRooms(rm.room_id, dateStr);
          if (baseAvail - locked < k) {
            available = false;
            break;
          }
        }

        if (available) {
          const totalCost = rm.price_per_night.amount * k * nights;
          options.push({
            hotel: htl,
            room: rm,
            qty: k,
            nights,
            checkIn: checkInDate,
            checkOut: addDays(checkInDate, nights),
            totalCost,
            stars: htl.stars,
            rating: htl.rating,
            family_friendly: htl.family_friendly
          });
        }
      }
    }

    return options;
  }

  buildSinglePackage(cityPlan, outFlight, inFlight, hotelTier, request) {
    const {
      start_date,
      nights,
      adults,
      children,
      child_ages,
      budget,
      traveler_name,
      homeAirport,
      validDep,
      validCountry,
      preferences = {}
    } = request;

    const totalTravelers = adults + children;
    const endDate = addDays(start_date, nights);
    const packageItems = [];

    // 1. Outbound Flight Item
    const outCost = outFlight.price_per_seat.amount * totalTravelers;
    const outArrCity = (catalog.airportsMap.get(outFlight.to) || {}).city || cityPlan[0].city;
    packageItems.push({
      item_id: `item-fl-out-${outFlight.flight_id}`,
      type: 'flight',
      name: `${outFlight.airline} ${outFlight.flight_number} (${outFlight.from} to ${outFlight.to})`,
      airline: outFlight.airline,
      flight_number: outFlight.flight_number,
      from_code: outFlight.from,
      to_code: outFlight.to,
      duration_minutes: outFlight.duration_minutes,
      stops: outFlight.stops,
      cabin: outFlight.cabin,
      city: outArrCity,
      status: 'PLANNED',
      catalog_id: outFlight.flight_id,
      room_id: null,
      start: outFlight.departure_local.substring(0, 16),
      end: outFlight.arrival_local.substring(0, 16),
      quantity: totalTravelers,
      price_inr: outCost,
      booking: null,
      sources: [],
      warnings: []
    });

    // 2. Select Hotels for each city based on hotelTier
    const hotelSelections = [];
    let curCheckIn = start_date;

    for (let i = 0; i < cityPlan.length; i++) {
      const seg = cityPlan[i];
      const validOptions = this.getValidHotelOptionsForCity(seg.city, curCheckIn, seg.nights, adults, children);
      if (validOptions.length === 0) return null;

      if (hotelTier === 'cheapest') {
        validOptions.sort((a, b) => a.totalCost - b.totalCost);
      } else if (hotelTier === 'luxury') {
        validOptions.sort((a, b) => b.stars - a.stars || b.totalCost - a.totalCost);
      } else if (hotelTier === 'family') {
        validOptions.sort((a, b) => (b.family_friendly ? 1 : 0) - (a.family_friendly ? 1 : 0) || a.totalCost - b.totalCost);
      } else {
        validOptions.sort((a, b) => b.rating - a.rating || a.totalCost - b.totalCost);
      }

      const chosen = validOptions[0];
      hotelSelections.push(chosen);
      curCheckIn = chosen.checkOut;
    }

    // 3. Arrival Airport Transfer
    const firstHotel = hotelSelections[0].hotel;
    const arrivalTransfers = (catalog.transfersAirportMap.get(`${outFlight.to}_${firstHotel.city}`) || []).filter(tr => {
      if (tr.area && tr.area !== firstHotel.area) return false;
      return true;
    });

    if (arrivalTransfers.length === 0) return null;

    const outArrTimeParts = outFlight.arrival_local.split('T')[1].substring(0, 5);
    const landingMins = parseTime(outArrTimeParts);
    const earliestPickupMins = landingMins + 60;

    let chosenArrTransfer = null;
    let arrPickupMins = earliestPickupMins;

    for (const tr of arrivalTransfers) {
      const sFrom = parseTime(tr.service_from);
      const sUntil = parseTime(tr.service_until);
      if (isTimeInWindow(earliestPickupMins, sFrom, sUntil)) {
        chosenArrTransfer = tr;
        arrPickupMins = earliestPickupMins;
        break;
      }
    }

    if (!chosenArrTransfer) {
      for (const tr of arrivalTransfers) {
        const sFrom = parseTime(tr.service_from);
        const sUntil = parseTime(tr.service_until);
        const testMins = sFrom > earliestPickupMins ? sFrom : earliestPickupMins;
        if (isTimeInWindow(testMins, sFrom, sUntil)) {
          chosenArrTransfer = tr;
          arrPickupMins = testMins;
          break;
        }
      }
    }

    if (!chosenArrTransfer) return null;

    const arrTrCost = this.calculateTransferCost(chosenArrTransfer, adults, children);
    const arrPickupTimeStr = formatMinutesToTime(arrPickupMins);
    const arrReachHotelMins = arrPickupMins + chosenArrTransfer.duration_minutes;
    const arrReachTimeStr = formatMinutesToTime(arrReachHotelMins);

    packageItems.push({
      item_id: `item-tr-arr-${chosenArrTransfer.transfer_id}`,
      type: 'transfer',
      name: `${chosenArrTransfer.name} (${chosenArrTransfer.from_point} to ${chosenArrTransfer.to_point})`,
      city: firstHotel.city,
      status: 'PLANNED',
      catalog_id: chosenArrTransfer.transfer_id,
      room_id: null,
      start: `${start_date}T${arrPickupTimeStr}`,
      end: `${start_date}T${arrReachTimeStr}`,
      quantity: arrTrCost.vehicles,
      price_inr: arrTrCost.cost,
      booking: null,
      sources: [],
      warnings: []
    });

    // 4. Hotel Items & Inter-City Transfers
    for (let i = 0; i < hotelSelections.length; i++) {
      const hs = hotelSelections[i];
      packageItems.push({
        item_id: `item-htl-${hs.hotel.hotel_id}-${hs.checkIn}`,
        type: 'hotel',
        name: `${hs.hotel.name} (${hs.room.name})`,
        hotel_name: hs.hotel.name,
        room_name: hs.room.name,
        image: hs.hotel.image || hs.room.image || 'images/hotels/HOTEL-TWIN-1.jpg',
        stars: hs.hotel.stars,
        rating: hs.hotel.rating,
        area: hs.hotel.area,
        family_friendly: hs.hotel.family_friendly,
        city: hs.hotel.city,
        status: 'PLANNED',
        catalog_id: hs.hotel.hotel_id,
        room_id: hs.room.room_id,
        start: hs.checkIn,
        end: hs.checkOut,
        quantity: hs.qty,
        price_inr: hs.totalCost,
        booking: null,
        sources: [],
        warnings: []
      });

      if (i < hotelSelections.length - 1) {
        const nextHs = hotelSelections[i + 1];
        const interKey = `${hs.hotel.city}_${nextHs.hotel.city}`;
        const interTransfers = catalog.transfersIntercityMap.get(interKey) || [];
        if (interTransfers.length === 0) return null;

        const chosenInter = interTransfers[0];
        const interCost = this.calculateTransferCost(chosenInter, adults, children);
        const departMins = parseTime(chosenInter.service_from) + 120;
        const reachMins = departMins + chosenInter.duration_minutes;

        packageItems.push({
          item_id: `item-tr-inter-${chosenInter.transfer_id}-${hs.checkOut}`,
          type: 'transfer',
          name: `${chosenInter.name} (${hs.hotel.city} to ${nextHs.hotel.city})`,
          city: nextHs.hotel.city,
          status: 'PLANNED',
          catalog_id: chosenInter.transfer_id,
          room_id: null,
          start: `${hs.checkOut}T${formatMinutesToTime(departMins)}`,
          end: `${hs.checkOut}T${formatMinutesToTime(reachMins)}`,
          quantity: interCost.vehicles,
          price_inr: interCost.cost,
          booking: null,
          sources: [],
          warnings: []
        });
      }
    }

    // 5. Departure Airport Transfer
    const lastHotel = hotelSelections[hotelSelections.length - 1].hotel;
    const returnTransfers = (catalog.transfersAirportMap.get(`${inFlight.from}_${lastHotel.city}`) || []).filter(tr => {
      if (tr.area && tr.area !== lastHotel.area) return false;
      return true;
    });

    if (returnTransfers.length === 0) return null;

    const inDepTimeParts = inFlight.departure_local.split('T')[1].substring(0, 5);
    const flightDepMins = parseTime(inDepTimeParts);
    const latestAirportReachMins = flightDepMins - 180;

    let chosenDepTransfer = null;
    let depPickupMins = 0;

    for (const tr of returnTransfers) {
      const reqPickup = latestAirportReachMins - tr.duration_minutes;
      const sFrom = parseTime(tr.service_from);
      const sUntil = parseTime(tr.service_until);
      if (isTimeInWindow(reqPickup, sFrom, sUntil)) {
        chosenDepTransfer = tr;
        depPickupMins = reqPickup;
        break;
      }
    }

    if (!chosenDepTransfer) return null;

    const depTrCost = this.calculateTransferCost(chosenDepTransfer, adults, children);
    const depPickupTimeStr = formatMinutesToTime(depPickupMins);
    const depReachAirportStr = formatMinutesToTime(depPickupMins + chosenDepTransfer.duration_minutes);

    packageItems.push({
      item_id: `item-tr-dep-${chosenDepTransfer.transfer_id}`,
      type: 'transfer',
      name: `${chosenDepTransfer.name} (${lastHotel.name} to ${chosenDepTransfer.to_point})`,
      city: lastHotel.city,
      status: 'PLANNED',
      catalog_id: chosenDepTransfer.transfer_id,
      room_id: null,
      start: `${endDate}T${depPickupTimeStr}`,
      end: `${endDate}T${depReachAirportStr}`,
      quantity: depTrCost.vehicles,
      price_inr: depTrCost.cost,
      booking: null,
      sources: [],
      warnings: []
    });

    // 6. Inbound Return Flight Item
    const inCost = inFlight.price_per_seat.amount * totalTravelers;
    packageItems.push({
      item_id: `item-fl-in-${inFlight.flight_id}`,
      type: 'flight',
      name: `${inFlight.airline} ${inFlight.flight_number} (${inFlight.from} to ${inFlight.to})`,
      airline: inFlight.airline,
      flight_number: inFlight.flight_number,
      from_code: inFlight.from,
      to_code: inFlight.to,
      duration_minutes: inFlight.duration_minutes,
      stops: inFlight.stops,
      cabin: inFlight.cabin,
      city: validDep.city,
      status: 'PLANNED',
      catalog_id: inFlight.flight_id,
      room_id: null,
      start: inFlight.departure_local.substring(0, 16),
      end: inFlight.arrival_local.substring(0, 16),
      quantity: totalTravelers,
      price_inr: inCost,
      booking: null,
      sources: [],
      warnings: []
    });

    // 7. Attractions Scheduling
    const scheduledAttractionIds = new Set();
    const prefPriority = preferences.primaryPriority || 'balanced';

    for (let d = 0; d < nights; d++) {
      const curDate = addDays(start_date, d);
      const isArrivalDay = (d === 0);

      const activeHs = hotelSelections.find(hs => curDate >= hs.checkIn && curDate < hs.checkOut);
      if (!activeHs) continue;

      const city = activeHs.hotel.city;
      const dayAttractions = catalog.attractionsByCity.get(city) || [];
      const dayOfWeek = getDayOfWeek(curDate);

      const eligible = dayAttractions.filter(att => {
        if (scheduledAttractionIds.has(att.attraction_id)) return false;
        if (att.city !== city) return false;
        if (!att.open_days.includes(dayOfWeek)) return false;
        if (att.closed_dates && att.closed_dates.includes(curDate)) return false;
        return true;
      });

      eligible.sort((a, b) => {
        if (prefPriority === 'experience' || prefPriority === 'spiritual') {
          const isSpiritA = (a.category === 'TEMPLE' || a.category === 'SHRINE' || a.category === 'MOSQUE') ? 1 : 0;
          const isSpiritB = (b.category === 'TEMPLE' || b.category === 'SHRINE' || b.category === 'MOSQUE') ? 1 : 0;
          if (isSpiritA !== isSpiritB) return isSpiritB - isSpiritA;
        } else if (children > 0) {
          const isKidA = a.child_friendly ? 1 : 0;
          const isKidB = b.child_friendly ? 1 : 0;
          if (isKidA !== isKidB) return isKidB - isKidA;
        }
        return (b.accessible ? 1 : 0) - (a.accessible ? 1 : 0);
      });

      let scheduledToday = 0;
      let currentFreeTime = isArrivalDay ? Math.max(parseTime('14:00'), arrReachHotelMins + 60) : parseTime('09:30');

      for (const att of eligible) {
        if (scheduledToday >= (isArrivalDay ? 1 : 2)) break;

        const openFrom = parseTime(att.open_from);
        const openUntil = parseTime(att.open_until);
        const startTime = Math.max(currentFreeTime, openFrom);
        const endTime = startTime + att.visit_minutes;

        if (endTime <= openUntil) {
          const attCost = this.calculateAttractionCost(att, adults, children);
          packageItems.push({
            item_id: `item-att-${att.attraction_id}-${curDate}`,
            type: 'attraction',
            name: att.name,
            image: att.image || 'images/attractions/ATT-TYO-001.jpg',
            category: att.category,
            rating: att.rating,
            description: att.description,
            city: att.city,
            status: 'PLANNED',
            catalog_id: att.attraction_id,
            room_id: null,
            start: `${curDate}T${formatMinutesToTime(startTime)}`,
            end: `${curDate}T${formatMinutesToTime(endTime)}`,
            quantity: totalTravelers,
            price_inr: attCost,
            booking: null,
            sources: [],
            warnings: []
          });

          scheduledAttractionIds.add(att.attraction_id);
          scheduledToday++;
          currentFreeTime = endTime + 45;
        }
      }
    }

    const totalPrice = packageItems.reduce((sum, item) => sum + item.price_inr, 0);

    let travelMins = outFlight.duration_minutes + inFlight.duration_minutes;
    for (const item of packageItems) {
      if (item.type === 'transfer') {
        const tr = catalog.transfers.find(t => t.transfer_id === item.catalog_id);
        if (tr && tr.from_city && tr.to_city) {
          travelMins += tr.duration_minutes;
        }
      }
    }

    let starSum = 0;
    let totalStayNights = 0;
    for (const hs of hotelSelections) {
      starSum += hs.hotel.stars * hs.nights;
      totalStayNights += hs.nights;
    }
    const avgStars = totalStayNights > 0 ? starSum / totalStayNights : 0;

    // Calculate component costs for Budget Analysis (Page 7)
    const flightCost = packageItems.filter(it => it.type === 'flight').reduce((s, it) => s + it.price_inr, 0);
    const hotelCost = packageItems.filter(it => it.type === 'hotel').reduce((s, it) => s + it.price_inr, 0);
    const transferCost = packageItems.filter(it => it.type === 'transfer').reduce((s, it) => s + it.price_inr, 0);
    const attractionCost = packageItems.filter(it => it.type === 'attraction').reduce((s, it) => s + it.price_inr, 0);

    return {
      trip_id: `trip-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      traveler: {
        name: traveler_name,
        home_airport: homeAirport,
        adults,
        children,
        child_ages
      },
      start_date,
      end_date: endDate,
      country: validCountry.name,
      budget_inr: budget,
      total_inr: totalPrice,
      items: packageItems,
      metrics: {
        total_price: totalPrice,
        travel_duration_minutes: travelMins,
        avg_stars: Number(avgStars.toFixed(2)),
        city_plan: cityPlan,
        flight_cost: flightCost,
        hotel_cost: hotelCost,
        transfer_cost: transferCost,
        attraction_cost: attractionCost,
        budget_utilization_pct: Math.min(100, Math.round((totalPrice / budget) * 100))
      }
    };
  }

  buildPackages(request) {
    const {
      departure_city = 'Bengaluru',
      country = 'Japan',
      start_date = '2027-04-10',
      nights = 6,
      adults = 2,
      children = 0,
      child_ages = [],
      budget = 350000,
      traveler_name = 'Traveler Party',
      preferences = {
        primaryPriority: 'balanced',
        hotelWeight: 40,
        flightWeight: 30,
        experienceWeight: 30,
        travelStyle: 'balanced'
      }
    } = request;

    const totalTravelers = adults + children;

    const validDep = catalog.destinations.departure_cities.find(
      d => d.city.toLowerCase() === (departure_city || '').toLowerCase() || d.airport.toLowerCase() === (departure_city || '').toLowerCase()
    );
    if (!validDep) {
      return { success: false, error: `Invalid departure city '${departure_city}'. Choose from: Bengaluru, Delhi, Mumbai, Chennai.` };
    }
    const homeAirport = validDep.airport;

    const validCountry = catalog.destinations.countries.find(
      c => c.name.toLowerCase() === (country || '').toLowerCase()
    );
    if (!validCountry) {
      return { success: false, error: `Invalid destination country '${country}'. Choose from: Japan, United Arab Emirates.` };
    }

    const { first_night, last_departure } = catalog.destinations.rules.data_window;
    if (start_date < first_night || start_date > last_departure) {
      return { success: false, error: `Holiday start date must be between ${first_night} and ${last_departure}. Data exists only for this window.` };
    }

    const endDate = addDays(start_date, nights);
    if (endDate > last_departure) {
      return { success: false, error: `Return date (${endDate}) exceeds catalog window limit ${last_departure}. Trip must end by ${last_departure}.` };
    }

    if (nights < catalog.destinations.rules.min_nights || nights > catalog.destinations.rules.max_nights) {
      return { success: false, error: `Trip nights must be between ${catalog.destinations.rules.min_nights} and ${catalog.destinations.rules.max_nights} nights.` };
    }

    if (adults < 1) {
      return { success: false, error: `At least 1 adult traveler is required.` };
    }

    let cityPlans = this.generateCityPlans(validCountry.name, nights);
    if (cityPlans.length === 0) {
      return { success: false, error: `No valid city sequence possible for ${nights} nights in ${validCountry.name}.` };
    }

    const allValidCityPlans = cityPlans;
    const requestedCityPlan = request.city_plan || request.cityPlan;
    if (requestedCityPlan && Array.isArray(requestedCityPlan) && requestedCityPlan.length > 0) {
      const targetSig = requestedCityPlan.map(s => `${s.city}_${s.nights}`).join('-');
      const foundPlan = cityPlans.find(cp => cp.map(s => `${s.city}_${s.nights}`).join('-') === targetSig);
      if (foundPlan) {
        cityPlans = [foundPlan];
      }
    }

    const reqContext = {
      start_date,
      nights,
      adults,
      children,
      child_ages,
      budget,
      traveler_name,
      homeAirport,
      validDep,
      validCountry,
      preferences
    };

    const candidatePackages = [];

    for (const cityPlan of cityPlans) {
      const firstCity = cityPlan[0].city;
      const lastCity = cityPlan[cityPlan.length - 1].city;

      const arrivalAirports = catalog.getAirportsServingCity(firstCity);
      const departureAirports = catalog.getAirportsServingCity(lastCity);

      const outKey = `${homeAirport}_${start_date}`;
      const potentialOutFlights = (catalog.outboundFlights.get(outKey) || []).filter(fl => {
        const locked = storage.getLockedSeats(fl.flight_id);
        return (fl.seats_left - locked >= totalTravelers) && arrivalAirports.includes(fl.to);
      });

      const inKey = `${homeAirport}_${endDate}`;
      const potentialInFlights = (catalog.inboundFlights.get(inKey) || []).filter(fl => {
        const locked = storage.getLockedSeats(fl.flight_id);
        return (fl.seats_left - locked >= totalTravelers) && departureAirports.includes(fl.from);
      });

      if (potentialOutFlights.length === 0 || potentialInFlights.length === 0) continue;

      const tiers = ['cheapest', 'balanced', 'luxury', 'family'];
      for (const tier of tiers) {
        for (const outFl of potentialOutFlights.slice(0, 3)) {
          for (const inFl of potentialInFlights.slice(0, 3)) {
            const pkg = this.buildSinglePackage(cityPlan, outFl, inFl, tier, reqContext);
            if (pkg) {
              candidatePackages.push(pkg);
            }
          }
        }
      }
    }

    if (candidatePackages.length === 0) {
      // Diagnostic bottleneck detection for M2 ("When no package is possible, the app says so and says why")
      const outKey = `${homeAirport}_${start_date}`;
      const allOut = catalog.outboundFlights.get(outKey) || [];
      const maxOut = allOut.length > 0 ? Math.max(...allOut.map(f => f.seats_left - storage.getLockedSeats(f.flight_id))) : 0;

      const inKey = `${homeAirport}_${endDate}`;
      const allIn = catalog.inboundFlights.get(inKey) || [];
      const maxIn = allIn.length > 0 ? Math.max(...allIn.map(f => f.seats_left - storage.getLockedSeats(f.flight_id))) : 0;

      let reason = '';
      const suggestions = [];

      if (allOut.length === 0) {
        reason = `No outbound flights operate from ${departure_city} (${homeAirport}) to ${validCountry.name} on ${start_date}.`;
        suggestions.push(`Change your holiday start date to an earlier or later day (between 1 and 20 April 2027).`);
      } else if (maxOut < totalTravelers) {
        reason = `Flight capacity bottleneck: Your party has ${totalTravelers} travelers (${adults} adults${children > 0 ? `, ${children} children` : ''}), but available flights from ${departure_city} on ${start_date} only have up to ${maxOut} open seats.`;
        suggestions.push(`Reduce the number of travelers to ${maxOut} or fewer to fit available aircraft seats.`);
        suggestions.push(`Try departing on a different date between 1 and 20 April 2027.`);
      } else if (allIn.length === 0) {
        reason = `No return flights operate from ${validCountry.name} to ${departure_city} on ${endDate}.`;
        suggestions.push(`Adjust your stay duration (${nights} nights) so the return flight falls on an active flight date.`);
      } else if (maxIn < totalTravelers) {
        reason = `Return flight capacity bottleneck: Your party has ${totalTravelers} travelers, but return flights to ${departure_city} on ${endDate} only have up to ${maxIn} open seats.`;
        suggestions.push(`Reduce the number of travelers to ${maxIn} or fewer.`);
        suggestions.push(`Change the number of nights so the return flight falls on a date with more seats.`);
      } else {
        reason = `Accommodation or transfer buffer conflict: No combination of certified hotels and airport transfers satisfied all required safety buffers (60 min arrival buffer and 180 min departure buffer) for ${totalTravelers} travelers across ${nights} nights in ${validCountry.name}.`;
        suggestions.push(`Try adjusting the number of nights or selecting a single destination city.`);
      }

      return {
        success: false,
        error: reason,
        reason: reason,
        suggestions: suggestions
      };
    }

    // Sort by price
    candidatePackages.sort((a, b) => a.total_inr - b.total_inr);
    const cheapestOverall = candidatePackages[0];

    const withinBudget = candidatePackages.filter(p => p.total_inr <= budget);

    if (withinBudget.length === 0) {
      const cheapestPkg = candidatePackages[0];
      const fastestPkg = [...candidatePackages].sort((a, b) => a.metrics.travel_duration_minutes - b.metrics.travel_duration_minutes)[0];
      const bestRatedPkg = [...candidatePackages].sort((a, b) => b.metrics.avg_stars - a.metrics.avg_stars || a.total_inr - b.total_inr)[0];

      return {
        success: true,
        budget_exceeded: true,
        packages: {
          cheapest: cheapestPkg,
          fastest: fastestPkg,
          best_rated: bestRatedPkg,
          priority_match: cheapestPkg
        },
        cheapest_package: cheapestPkg,
        message: `No holiday package fits within your budget of ₹${budget.toLocaleString('en-IN')}. The most affordable valid package starts at ₹${cheapestPkg.total_inr.toLocaleString('en-IN')}.`,
        suggestions: [
          `Increase your budget by ₹${(cheapestPkg.total_inr - budget).toLocaleString('en-IN')} to book the cheapest plan.`,
          `Reduce your stay to ${Math.max(3, nights - 1)} or ${Math.max(3, nights - 2)} nights.`,
          `Consider visiting a single city to eliminate inter-city transfer costs.`
        ],
        available_city_plans: allValidCityPlans.map(cp => ({
          label: cp.map(s => `${s.city} (${s.nights}N)`).join(' ➔ '),
          plan: cp
        }))
      };
    }

    // Required G4 Packages:
    const cheapestPkg = withinBudget[0];
    const fastestPkg = [...withinBudget].sort((a, b) => a.metrics.travel_duration_minutes - b.metrics.travel_duration_minutes)[0];
    const bestRatedPkg = [...withinBudget].sort((a, b) => b.metrics.avg_stars - a.metrics.avg_stars || a.total_inr - b.total_inr)[0];

    // Priority-Based Package (Weighted Scoring per user sliders: Section 4 Page 4)
    const wHotel = (preferences.hotelWeight || 40) / 100;
    const wFlight = (preferences.flightWeight || 30) / 100;
    const wExp = (preferences.experienceWeight || 30) / 100;

    const scoredPackages = withinBudget.map(pkg => {
      // Hotel score: stars normalized (2-5 stars -> 0-1)
      const hotelScore = (pkg.metrics.avg_stars - 2) / 3;
      // Flight score: lower travel time is better (max transit time approx 1500m -> 0-1)
      const flightScore = Math.max(0, 1 - (pkg.metrics.travel_duration_minutes - 900) / 600);
      // Experience score: number of attractions (0-10 -> 0-1)
      const attCount = pkg.items.filter(it => it.type === 'attraction').length;
      const expScore = Math.min(1, attCount / 8);

      // Trade-off budget efficiency: rewards economizing on non-priority items to balance overall cost
      const budgetSavingsScore = Math.max(0, 1 - (pkg.total_inr / budget));

      let totalWeightedScore = (wHotel * hotelScore) + (wFlight * flightScore) + (wExp * expScore);
      if (wHotel >= 0.50) {
        // High hotel preference: heavily prioritize 4★/5★ luxury stays + reward economizing flights
        totalWeightedScore = (hotelScore * 0.70) + (budgetSavingsScore * 0.30);
      } else if (wFlight >= 0.50) {
        // High flight preference: prioritize non-stop speed + budget efficiency
        totalWeightedScore = (flightScore * 0.70) + (budgetSavingsScore * 0.30);
      } else if (wExp >= 0.45) {
        // High experience preference: maximize attractions and tour passes
        totalWeightedScore = (expScore * 0.70) + (budgetSavingsScore * 0.30);
      }

      return {
        pkg,
        score: totalWeightedScore
      };
    });

    scoredPackages.sort((a, b) => b.score - a.score);
    const priorityPkg = scoredPackages[0].pkg;

    return {
      success: true,
      budget_exceeded: false,
      packages: {
        cheapest: cheapestPkg,
        fastest: fastestPkg,
        best_rated: bestRatedPkg,
        priority_match: priorityPkg
      },
      available_city_plans: allValidCityPlans.map(cp => ({
        label: cp.map(s => `${s.city} (${s.nights}N)`).join(' ➔ '),
        plan: cp
      })),
      total_candidates: candidatePackages.length,
      user_weights: {
        hotel: preferences.hotelWeight || 40,
        flight: preferences.flightWeight || 30,
        experience: preferences.experienceWeight || 30
      }
    };
  }

  // Page 3: Smart Destination Discovery Engine
  discoverDestinations(criteria) {
    const {
      departure_city = 'Bengaluru',
      budget = 350000,
      nights = 6,
      travelers = 3,
      preferred_style = 'balanced'
    } = criteria;

    const destinations = [
      {
        id: 'dest-japan',
        name: 'Japan',
        cities: ['Tokyo', 'Kyoto', 'Osaka'],
        tagline: 'Ancient Shrines, Futuristic Skylines & Sakura Gardens',
        image: 'images/attractions/ATT-KYO-001.jpg',
        best_for: 'Culture, Spiritual Pilgrimage, Anime & Theme Parks',
        estimated_min_budget: 250000,
        suitability_score: 95,
        reason: 'Fits your 6-night duration with direct/1-stop flights from Bengaluru and incredible family & pilgrimage activities.'
      },
      {
        id: 'dest-uae',
        name: 'United Arab Emirates',
        cities: ['Dubai', 'Abu Dhabi'],
        tagline: 'Grand Mosques, Luxury Dunes & World-Class Resorts',
        image: 'images/attractions/ATT-AUH-001.jpg',
        best_for: 'Luxury Stays, Grand Mosques & Fast Travel',
        estimated_min_budget: 180000,
        suitability_score: 92,
        reason: 'Shorter flight duration (approx 4h) with majestic spiritual landmarks like Sheikh Zayed Grand Mosque.'
      }
    ];

    return destinations.map(d => ({
      ...d,
      is_within_budget: budget >= d.estimated_min_budget
    }));
  }
}

module.exports = new PlannerService();
