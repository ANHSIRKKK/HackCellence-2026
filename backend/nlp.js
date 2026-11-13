class NlpService {
  parse(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    let lower = text.toLowerCase();
    // Normalize word numbers to digits (e.g. "two adults, one child" -> "2 adults, 1 child")
    const wordNums = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };
    for (const [w, n] of Object.entries(wordNums)) {
      lower = lower.replace(new RegExp(`\\b${w}\\b`, 'g'), n);
    }
    const result = {
      traveler_name: 'Traveler Party',
      departure_city: 'Bengaluru',
      country: 'Japan',
      start_date: '2027-04-10',
      nights: 6,
      adults: 2,
      children: 0,
      child_ages: [],
      budget: 350000,
      preference: 'all_round'
    };

    // 1. Detect Traveler Name (e.g. "Menon family", "Sharma family")
    const familyMatch = text.match(/([a-zA-Z]+)\s+family/i);
    if (familyMatch) {
      result.traveler_name = `${familyMatch[1]} family`;
    }

    // 2. Detect Departure City
    if (lower.includes('blr') || lower.includes('bengaluru') || lower.includes('bangalore')) {
      result.departure_city = 'Bengaluru';
    } else if (lower.includes('del') || lower.includes('delhi')) {
      result.departure_city = 'Delhi';
    } else if (lower.includes('bom') || lower.includes('mumbai') || lower.includes('bombay')) {
      result.departure_city = 'Mumbai';
    } else if (lower.includes('maa') || lower.includes('chennai') || lower.includes('madras')) {
      result.departure_city = 'Chennai';
    }

    // 3. Detect Destination Country
    if (lower.includes('japan') || lower.includes('tokyo') || lower.includes('kyoto') || lower.includes('osaka')) {
      result.country = 'Japan';
    } else if (lower.includes('uae') || lower.includes('emirates') || lower.includes('dubai') || lower.includes('abu dhabi')) {
      result.country = 'United Arab Emirates';
    }

    // 4. Detect Adults
    const adultMatch = lower.match(/(\d+)\s*(?:adults?|grown-ups?|parents?)/i);
    if (adultMatch) {
      result.adults = parseInt(adultMatch[1], 10);
    }

    // 5. Detect Children & Ages
    const childMatch = lower.match(/(\d+)\s*(?:children|child|kids?)/i);
    if (childMatch) {
      result.children = parseInt(childMatch[1], 10);
    }

    const ageMatch = lower.match(/(?:age|aged?)\s*(\d+)/i) || lower.match(/(\d+)\s*(?:years?\s*old|yo)/i);
    if (ageMatch && result.children > 0) {
      result.child_ages = [parseInt(ageMatch[1], 10)];
      while (result.child_ages.length < result.children) {
        result.child_ages.push(parseInt(ageMatch[1], 10));
      }
    } else if (result.children > 0) {
      result.child_ages = Array(result.children).fill(6);
    }

    // 6. Detect Nights
    const nightsMatch = lower.match(/(\d+)\s*(?:nights?|n\b)/i);
    if (nightsMatch) {
      result.nights = parseInt(nightsMatch[1], 10);
    } else {
      const daysMatch = lower.match(/(\d+)\s*(?:days?)/i);
      if (daysMatch) {
        result.nights = Math.max(3, parseInt(daysMatch[1], 10) - 1);
      }
    }

    // 7. Detect Dates (e.g. "10 April", "10th April", "2027-04-10")
    const isoDateMatch = text.match(/2027-04-(\d{2})/);
    if (isoDateMatch) {
      result.start_date = `2027-04-${isoDateMatch[1]}`;
    } else {
      const aprilMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*)?april/i) || lower.match(/april\s*(\d{1,2})/i);
      if (aprilMatch) {
        const day = String(parseInt(aprilMatch[1], 10)).padStart(2, '0');
        result.start_date = `2027-04-${day}`;
      }
    }

    // 8. Detect Budget (e.g. "3.5L", "3,50,000", "350000", "2 lakh")
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|l\b)/i);
    if (lakhMatch) {
      result.budget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else {
      const numBudget = lower.match(/(?:budget|under|for|max|₹|rs\.?)\s*(?:inr|rs\.?|₹)?\s*(\d[\d,]{3,})/i) || lower.match(/(\d[\d,]{4,})/);
      if (numBudget) {
        result.budget = parseInt(numBudget[1].replace(/,/g, ''), 10);
      }
    }

    // 9. Detect User Preferences (Spiritual / Kids / Luxury / Budget)
    if (lower.includes('tirth') || lower.includes('yatra') || lower.includes('temple') || lower.includes('spiritual') || lower.includes('shrine') || lower.includes('heritage')) {
      result.preference = 'spiritual';
    } else if (lower.includes('kid') || lower.includes('family') || lower.includes('disney') || lower.includes('fun') || lower.includes('aquarium')) {
      result.preference = 'family_kids';
    } else if (lower.includes('luxury') || lower.includes('5 star') || lower.includes('best hotel')) {
      result.preference = 'luxury_hotel';
    } else if (lower.includes('cheap') || lower.includes('budget saver') || lower.includes('economy')) {
      result.preference = 'budget_saver';
    }

    return result;
  }
}

module.exports = new NlpService();

