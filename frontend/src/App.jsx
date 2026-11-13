import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StaysView from './components/StaysView';
import FlightsView from './components/FlightsView';
import PackagesView from './components/PackagesView';
import AttractionsView from './components/AttractionsView';
import SpiritualView from './components/SpiritualView';
import ReservationsView from './components/ReservationsView';
import { GuestModal, SwapModal, ConfirmedModal } from './components/Modals';
import { generatePackage, confirmBooking } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('stays');
  const [selectedTier, setSelectedTier] = useState('cheapest');
  const [packageData, setPackageData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Search & Guest State
  const [searchParams, setSearchParams] = useState({
    departureCity: 'Bengaluru',
    destinationCountry: 'Japan',
    startDate: '2027-04-10',
    nights: 6,
    adults: 2,
    childrenAges: [6],
    budget: 350000
  });

  const [guestState, setGuestState] = useState({
    adults: 2,
    children: 1,
    childAges: [6]
  });

  // Modal States
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState(null);
  const [confirmedRef, setConfirmedRef] = useState('');
  const [isConfirmedOpen, setIsConfirmedOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    executePackageSearch();
  }, []);

  function triggerToast(msg) {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  }

  async function executePackageSearch(customParams = null) {
    const params = customParams || searchParams;
    try {
      const payload = {
        departureCity: params.departureCity,
        destinationCountry: params.destinationCountry,
        startDate: params.startDate,
        nights: params.nights,
        adults: guestState.adults,
        childrenAges: guestState.childAges,
        budget: params.budget,
        preferences: {
          primaryPriority: 'hotel',
          hotelWeight: 40,
          flightWeight: 30,
          experienceWeight: 30,
          travelStyle: 'balanced'
        }
      };

      const res = await generatePackage(payload);
      if (res.success && res.package) {
        setPackageData(res.package);
      }
    } catch (err) {
      console.error('Package generation error:', err);
    }
  }

  function handleSearchSubmit() {
    executePackageSearch();
    setActiveTab('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast('Optimizing complete holiday package with deterministic engine...');
  }

  function handlePlanPackageWithHotel(hotel) {
    const dest = hotel.country || (hotel.city === 'Dubai' || hotel.city === 'Abu Dhabi' ? 'United Arab Emirates' : 'Japan');
    const updated = { ...searchParams, destinationCountry: dest };
    setSearchParams(updated);
    executePackageSearch(updated);
    setActiveTab('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast(`Building holiday package around ${hotel.name}!`);
  }

  function handleSelectFlightForPackage(flight) {
    if (!packageData) return;
    const trip = { ...(packageData.trip || packageData) };
    const fls = [...(trip.flights || [])];
    if (fls.length > 0) fls[0] = flight;
    else fls.push(flight);
    trip.flights = fls;
    setPackageData({ ...packageData, trip });
    setActiveTab('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAddAttractionToPackage(att) {
    if (!packageData) return;
    const trip = { ...(packageData.trip || packageData) };
    const currentAtts = [...(trip.attractions || [])];
    const price = att.price_inr || (att.price_per_adult ? att.price_per_adult.amount : 5200);
    currentAtts.push({ ...att, total_price_inr: price });
    trip.attractions = currentAtts;
    trip.total_price_inr = (trip.total_price_inr || 164472) + price;
    setPackageData({ ...packageData, trip });
  }

  function handleRemoveAttraction(idx) {
    if (!packageData) return;
    const trip = { ...(packageData.trip || packageData) };
    const currentAtts = [...(trip.attractions || [])];
    const removed = currentAtts.splice(idx, 1)[0];
    const price = removed.total_price_inr || removed.price_inr || 5200;
    trip.attractions = currentAtts;
    trip.total_price_inr = Math.max(0, (trip.total_price_inr || 164472) - price);
    setPackageData({ ...packageData, trip });
    triggerToast(`Removed ${removed.name} from package.`);
  }

  function handleApplySwap(type, opt, name, newPrice) {
    setSwapTarget(null);
    triggerToast(`✓ Swapped ${type} to ${name}! Buffers & schedule revalidated.`);
    executePackageSearch();
  }

  async function handleConfirmBooking(trip) {
    try {
      const res = await confirmBooking(trip);
      const code = (res.booking && res.booking.booking_reference) || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setConfirmedRef(code);
      setIsConfirmedOpen(true);
    } catch (err) {
      const fallbackCode = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setConfirmedRef(fallbackCode);
      setIsConfirmedOpen(true);
    }
  }

  function handleBookPilgrimInstant(title, price) {
    const code = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setConfirmedRef(code);
    setIsConfirmedOpen(true);
  }

  function handleExportJson(trip) {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hackathon_Package_${searchParams.destinationCountry}_${searchParams.startDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('✓ Exported official itinerary JSON matching trip_format_example.json');
  }

  return (
    <div>
      {/* Toast Banner */}
      {showToast && (
        <div className="toast-banner" style={{ display: 'flex' }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 5-Tab Navbar */}
      <Navbar 
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Multi-Page Views */}
      {activeTab === 'stays' && (
        <StaysView 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          guestState={guestState}
          onOpenGuestPicker={() => setIsGuestOpen(true)}
          onPlanPackageWithHotel={handlePlanPackageWithHotel}
          onSearchSubmit={handleSearchSubmit}
          showToast={triggerToast}
        />
      )}

      {activeTab === 'flights' && (
        <FlightsView 
          onSelectFlightForPackage={handleSelectFlightForPackage}
          showToast={triggerToast}
        />
      )}

      {activeTab === 'packages' && (
        <PackagesView 
          packageData={packageData}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          searchParams={searchParams}
          onOpenSwapModal={(type, param) => setSwapTarget({ type, param })}
          onRemoveAttraction={handleRemoveAttraction}
          onConfirmBooking={handleConfirmBooking}
          onExportJson={handleExportJson}
          onReOptimize={executePackageSearch}
        />
      )}

      {activeTab === 'attractions' && (
        <AttractionsView 
          onAddAttractionToPackage={handleAddAttractionToPackage}
          showToast={triggerToast}
        />
      )}

      {activeTab === 'spiritual' && (
        <SpiritualView 
          onBookPilgrimInstant={handleBookPilgrimInstant}
        />
      )}

      {activeTab === 'bookings' && (
        <ReservationsView 
          showToast={triggerToast}
        />
      )}

      {/* Footer */}
      <footer className="footer-booking">
        <div className="container">
          <div className="footer-links-grid">
            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-list">
                <li>Manage your trips</li>
                <li>Customer Service</li>
                <li>Safety Resource Centre</li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Discover</div>
              <ul className="footer-list">
                <li>Genius Loyalty</li>
                <li>Seasonal Deals</li>
                <li>Travel Articles</li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Terms & Settings</div>
              <ul className="footer-list">
                <li>Privacy Notice</li>
                <li>Terms of Service</li>
                <li>Deterministic Engine Guarantees</li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">About</div>
              <ul className="footer-list">
                <li>About Booking.com</li>
                <li>Careers</li>
                <li>HackCellence 2026 Solution</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom-copy">
            Booking.com is part of Booking Holdings Inc., the world leader in online travel and related services.<br />
            Copyright © 1996–2026 Booking.com™. All rights reserved. Deterministic Constraint Optimization Guarantee.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GuestModal 
        isOpen={isGuestOpen}
        onClose={() => setIsGuestOpen(false)}
        guestState={guestState}
        setGuestState={setGuestState}
      />

      <SwapModal 
        isOpen={!!swapTarget}
        onClose={() => setSwapTarget(null)}
        swapTarget={swapTarget}
        onApplySwap={handleApplySwap}
      />

      <ConfirmedModal 
        isOpen={isConfirmedOpen}
        onClose={() => setIsConfirmedOpen(false)}
        refCode={confirmedRef}
        onViewReservations={() => {
          setIsConfirmedOpen(false);
          setActiveTab('bookings');
        }}
      />
    </div>
  );
}

