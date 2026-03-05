import React, { useState } from 'react';
import styles from '../styles/Components.module.css';

const TicketBooking = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('flight');
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const bookingTypes = [
    { id: 'flight', name: 'Flights', icon: '✈️' },
    { id: 'train', name: 'Trains', icon: '🚂' },
    { id: 'bus', name: 'Buses', icon: '🚌' },
    { id: 'movie', name: 'Movies', icon: '🎬' }
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'
  ];

  const mockFlights = [
    {
      id: 1,
      airline: 'IndiGo',
      logo: '🔵',
      departure: '06:00',
      arrival: '08:30',
      duration: '2h 30m',
      stops: 'Non-stop',
      price: 4599,
      seats: 15
    },
    {
      id: 2,
      airline: 'Air India',
      logo: '🟠',
      departure: '09:15',
      arrival: '11:45',
      duration: '2h 30m',
      stops: 'Non-stop',
      price: 5299,
      seats: 8
    },
    {
      id: 3,
      airline: 'Vistara',
      logo: '🟣',
      departure: '14:30',
      arrival: '17:15',
      duration: '2h 45m',
      stops: '1 Stop',
      price: 4899,
      seats: 23
    },
    {
      id: 4,
      airline: 'SpiceJet',
      logo: '🔴',
      departure: '19:00',
      arrival: '21:30',
      duration: '2h 30m',
      stops: 'Non-stop',
      price: 3999,
      seats: 5
    }
  ];

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleBook = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.({
        type: activeTab,
        flight: selectedFlight,
        booking: searchData,
        pnr: 'PNR' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    }, 2000);
  };

  return (
    <div className={styles.ticketOverlay}>
      <div className={styles.ticketModal}>
        <div className={styles.ticketHeader}>
          <h2>🎫 Book Tickets</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Booking Type Tabs */}
        <div className={styles.bookingTabs}>
          {bookingTypes.map(type => (
            <button
              key={type.id}
              className={`${styles.bookingTab} ${activeTab === type.id ? styles.active : ''}`}
              onClick={() => { setActiveTab(type.id); setStep(1); }}
            >
              <span className={styles.tabIcon}>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.ticketBody}>
          {/* Step 1: Search */}
          {step === 1 && (
            <div className={styles.searchForm}>
              <div className={styles.routeInputs}>
                <div className={styles.inputGroup}>
                  <label>From</label>
                  <select 
                    value={searchData.from}
                    onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <button className={styles.swapBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16V4M7 4L3 8M7 4L11 8"/>
                    <path d="M17 8V20M17 20L21 16M17 20L13 16"/>
                  </svg>
                </button>

                <div className={styles.inputGroup}>
                  <label>To</label>
                  <select 
                    value={searchData.to}
                    onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.dateInputs}>
                <div className={styles.inputGroup}>
                  <label>Departure Date</label>
                  <input 
                    type="date"
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Return Date (Optional)</label>
                  <input 
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => setSearchData({...searchData, returnDate: e.target.value})}
                    min={searchData.date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className={styles.optionInputs}>
                <div className={styles.inputGroup}>
                  <label>Passengers</label>
                  <select 
                    value={searchData.passengers}
                    onChange={(e) => setSearchData({...searchData, passengers: e.target.value})}
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Class</label>
                  <select 
                    value={searchData.class}
                    onChange={(e) => setSearchData({...searchData, class: e.target.value})}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <button 
                className={`${styles.searchBtn} ${isLoading ? styles.loading : ''}`}
                onClick={handleSearch}
                disabled={!searchData.from || !searchData.to || !searchData.date || isLoading}
              >
                {isLoading ? 'Searching...' : 'Search Flights'}
              </button>
            </div>
          )}

          {/* Step 2: Results */}
          {step === 2 && (
            <div className={styles.searchResults}>
              <div className={styles.resultsHeader}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  ← Modify Search
                </button>
                <div className={styles.routeInfo}>
                  <span>{searchData.from}</span>
                  <span>→</span>
                  <span>{searchData.to}</span>
                </div>
                <span className={styles.dateInfo}>
                  {new Date(searchData.date).toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })}
                </span>
              </div>

              <div className={styles.flightsList}>
                {mockFlights.map(flight => (
                  <div 
                    key={flight.id} 
                    className={`${styles.flightCard} ${selectedFlight?.id === flight.id ? styles.selected : ''}`}
                    onClick={() => setSelectedFlight(flight)}
                  >
                    <div className={styles.flightInfo}>
                      <div className={styles.airline}>
                        <span className={styles.airlineLogo}>{flight.logo}</span>
                        <span className={styles.airlineName}>{flight.airline}</span>
                      </div>
                      <div className={styles.flightTime}>
                        <div className={styles.departure}>
                          <span className={styles.time}>{flight.departure}</span>
                          <span className={styles.city}>{searchData.from}</span>
                        </div>
                        <div className={styles.duration}>
                          <span>{flight.duration}</span>
                          <div className={styles.flightLine}>
                            <span className={styles.dot}></span>
                            <span className={styles.line}></span>
                            <span className={styles.plane}>✈</span>
                            <span className={styles.line}></span>
                            <span className={styles.dot}></span>
                          </div>
                          <span className={styles.stops}>{flight.stops}</span>
                        </div>
                        <div className={styles.arrival}>
                          <span className={styles.time}>{flight.arrival}</span>
                          <span className={styles.city}>{searchData.to}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.flightPrice}>
                      <span className={styles.price}>₹{flight.price.toLocaleString()}</span>
                      <span className={styles.seats}>{flight.seats} seats left</span>
                      {selectedFlight?.id === flight.id && (
                        <span className={styles.selectedBadge}>✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedFlight && (
                <div className={styles.bookingFooter}>
                  <div className={styles.totalPrice}>
                    <span>Total ({searchData.passengers} passenger{searchData.passengers > 1 ? 's' : ''})</span>
                    <span className={styles.amount}>
                      ₹{(selectedFlight.price * searchData.passengers).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    className={`${styles.bookBtn} ${isLoading ? styles.loading : ''}`}
                    onClick={handleBook}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Book Now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;