import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './AuthContext';
import { Message } from './components';

const money = amount => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(amount || 0);

function TourPackageCard({ tourPackage, user }) {
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const book = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { booking } = await api('/tour-bookings', {
        method: 'POST',
        body: JSON.stringify({ packageId: tourPackage._id, travelDate, travelers: Number(travelers) })
      });
      setMessage(`Booking ${booking.bookingCode} confirmed. Total: ${money(booking.totalPrice)}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <article className="tour-card card">
    {tourPackage.imageUrl && <img className="tour-image" src={tourPackage.imageUrl} alt={tourPackage.name} />}
    <div className="tour-content">
      <p className="eyebrow">{tourPackage.destination}</p>
      <h2>{tourPackage.name}</h2>
      <p className="muted">{tourPackage.description}</p>
      {tourPackage.provider?.name && <p className="muted">Offered by {tourPackage.provider.name}</p>}
      <div className="tour-summary">
        <b>{money(tourPackage.pricePerTraveler)} <small>per traveler</small></b>
        <span>{tourPackage.durationDays} {tourPackage.durationDays === 1 ? 'day' : 'days'}</span>
      </div>
      {tourPackage.itinerary?.length > 0 && <section>
        <h3>Itinerary</h3>
        <ol className="itinerary">{tourPackage.itinerary.map((item, index) =>
          <li key={`${item.day}-${index}`}>
            <b>Day {item.day}: {item.title}</b>
            {item.description && <p>{item.description}</p>}
          </li>
        )}</ol>
      </section>}
      {tourPackage.facilities?.length > 0 && <section>
        <h3>Included facilities</h3>
        <ul className="facility-list">{tourPackage.facilities.map(facility =>
          <li key={facility}>{facility}</li>
        )}</ul>
      </section>}
      {message && <Message success={message} />}
      <Message error={error} />
      {user?.role === 'customer'
        ? <form className="tour-booking-form" onSubmit={book}>
          <h3>Book this package</h3>
          <label>Travel date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={travelDate} onChange={event => setTravelDate(event.target.value)} /></label>
          <label>Travelers<input required type="number" min="1" step="1" value={travelers} onChange={event => setTravelers(event.target.value)} /></label>
          <button className="primary" disabled={busy}>{busy ? 'Booking…' : 'Book package'}</button>
        </form>
        : <p className="muted">{user
          ? 'Package bookings are available to customer accounts.'
          : <> <Link to="/login">Log in</Link> with a customer account to book.</>}</p>}
    </div>
  </article>;
}

export function Tours() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    api('/tours')
      .then(data => setPackages(data.packages))
      .catch(requestError => setError(requestError.message))
      .finally(() => setBusy(false));
  }, []);

  const search = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const query = destination.trim();
      const data = await api(query ? `/tours?destination=${encodeURIComponent(query)}` : '/tours');
      setPackages(data.packages);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="container">
    <div className="section-head">
      <div><p className="eyebrow">DISCOVER MORE</p><h1>Tour packages</h1></div>
      {user?.role === 'customer' && <Link className="secondary" to="/tour-bookings">My tour bookings</Link>}
    </div>
    <form className="tour-search" onSubmit={search}>
      <label>Destination<input placeholder="Search a destination" value={destination} onChange={event => setDestination(event.target.value)} /></label>
      <button className="primary" disabled={busy}>{busy ? 'Searching…' : 'Find tours'}</button>
      {destination && <button className="secondary" type="button" disabled={busy} onClick={async () => {
        setDestination('');
        setBusy(true);
        setError('');
        try {
          const data = await api('/tours');
          setPackages(data.packages);
        } catch (requestError) {
          setError(requestError.message);
        } finally {
          setBusy(false);
        }
      }}>Clear</button>}
    </form>
    <Message error={error} />
    {busy ? <p>Loading tour plans…</p> : packages.length
      ? <div className="tour-grid">{packages.map(tourPackage =>
        <TourPackageCard key={tourPackage._id} tourPackage={tourPackage} user={user} />
      )}</div>
      : !error && <div className="empty">No tour packages are available right now.</div>}
  </main>;
}

export function TourBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/tour-bookings/my')
      .then(data => setBookings(data.bookings))
      .catch(requestError => setError(requestError.message));
  }, []);

  return <main className="container">
    <p className="eyebrow">YOUR ACCOUNT</p>
    <h1>My tour bookings</h1>
    <Message error={error} />
    {bookings.length
      ? bookings.map(booking => <article className="booking card" key={booking._id}>
        <div>
          <p className="eyebrow">{booking.bookingCode}</p>
          <h3>{booking.packageName} · {booking.destination}</h3>
          <p>{new Date(booking.travelDate).toLocaleDateString()} · {booking.travelers} traveler(s) · {booking.durationDays} days</p>
          <b>{money(booking.totalPrice)}</b>
        </div>
        <span className={`status ${booking.status}`}>{booking.status}</span>
      </article>)
      : !error && <div className="empty">You have no tour bookings yet. <Link to="/tours">Explore packages</Link>.</div>}
  </main>;
}
