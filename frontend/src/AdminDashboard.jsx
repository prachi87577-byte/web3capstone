import { useEffect, useState } from 'react';
import { api } from './api';
import { Message } from './components';
import { TourPackageForm } from './TourPackageForm';

const money = amount => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(amount || 0);

function ActionForm({ title, initialError = '', onSubmit, children, submitLabel = 'Save changes' }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit(new FormData(event.currentTarget));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <form className="admin-edit-form" onSubmit={submit}>
    {title && <h3>{title}</h3>}
    {children}
    <Message error={error} />
    <button className="secondary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
  </form>;
}

function UserRow({ user, onSave }) {
  return <div className="admin-row">
    <div><b>{user.name}</b><small>{user.email}</small><small className="muted">{user.role}</small></div>
    {user.role === 'admin'
      ? <span className="status">Admin account</span>
      : <ActionForm onSubmit={form => onSave(user._id, {
        role: form.get('role'),
        active: form.get('active') === 'on'
      })}>
        <label>Role<select name="role" defaultValue={user.role}>
          <option value="customer">Customer</option><option value="provider">Provider</option>
        </select></label>
        <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={user.active !== false} /> Active</label>
      </ActionForm>}
  </div>;
}

const emptyHotel = {
  name: '', description: '', city: '', state: '', country: 'India',
  locality: '', address: '', imageUrl: '', amenities: 'Wi-Fi, Parking',
  manager: '', active: true
};

function HotelForm({ hotel = emptyHotel, providers, onSave, submitLabel }) {
  const [amenities, setAmenities] = useState((hotel.amenities || []).join(', '));
  useEffect(() => setAmenities((hotel.amenities || []).join(', ')), [hotel]);
  return <ActionForm title={hotel._id ? hotel.name : 'Add hotel'} submitLabel={submitLabel}
    onSubmit={form => onSave({
      name: form.get('name'),
      description: form.get('description'),
      city: form.get('city'),
      state: form.get('state'),
      country: form.get('country'),
      locality: form.get('locality'),
      address: form.get('address'),
      imageUrl: form.get('imageUrl'),
      amenities: amenities.split(',').map(value => value.trim()).filter(Boolean),
      manager: form.get('manager'),
      ...(hotel._id ? { active: form.get('active') === 'on' } : { active: true })
    })}>
    <label>Name<input name="name" required defaultValue={hotel.name} /></label>
    <label>Description<textarea name="description" required defaultValue={hotel.description} /></label>
    <div className="admin-form-grid">
      <label>City<input name="city" required defaultValue={hotel.city} /></label>
      <label>State<input name="state" defaultValue={hotel.state} /></label>
      <label>Country<input name="country" defaultValue={hotel.country || 'India'} /></label>
      <label>Locality<input name="locality" defaultValue={hotel.locality} /></label>
    </div>
    <label>Address<input name="address" required defaultValue={hotel.address} /></label>
    <label>Image URL<input name="imageUrl" defaultValue={hotel.imageUrl} /></label>
    <label>Amenities<input value={amenities} onChange={event => setAmenities(event.target.value)} /></label>
    <label>Provider<select name="manager" required defaultValue={hotel.manager?._id || hotel.manager || ''}>
      <option value="">Select a provider</option>
      {providers.map(provider => <option key={provider._id} value={provider._id}>{provider.name} · {provider.email}</option>)}
    </select></label>
    {hotel._id && <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={hotel.active !== false} /> Active</label>}
  </ActionForm>;
}

function RoomForm({ room, hotels, onSave, submitLabel }) {
  return <ActionForm title={room._id ? room.name : 'Add room listing'} submitLabel={submitLabel}
    onSubmit={form => onSave({
      hotel: form.get('hotel'),
      name: form.get('name'),
      description: form.get('description'),
      pricePerNight: Number(form.get('pricePerNight')),
      capacity: Number(form.get('capacity')),
      totalRooms: Number(form.get('totalRooms')),
      imageUrl: form.get('imageUrl'),
      ...(room._id ? { active: form.get('active') === 'on' } : { active: true })
    })}>
    {!room._id && <label>Hotel<select name="hotel" required defaultValue="">
      <option value="">Select a hotel</option>
      {hotels.filter(hotel => hotel.active !== false).map(hotel =>
        <option key={hotel._id} value={hotel._id}>{hotel.name}</option>)}
    </select></label>}
    <label>Room type<input name="name" required defaultValue={room.name} /></label>
    <label>Description<textarea name="description" defaultValue={room.description} /></label>
    <div className="admin-form-grid">
      <label>Price per night<input name="pricePerNight" type="number" min="1" step="1" required defaultValue={room.pricePerNight || 1} /></label>
      <label>Capacity<input name="capacity" type="number" min="1" step="1" required defaultValue={room.capacity || 1} /></label>
      <label>Total rooms<input name="totalRooms" type="number" min="1" step="1" required defaultValue={room.totalRooms || 1} /></label>
    </div>
    <label>Image URL<input name="imageUrl" defaultValue={room.imageUrl} /></label>
    {room._id && <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={room.active !== false} /> Active</label>}
  </ActionForm>;
}

function BookingStatusForm({ booking, onSave }) {
  return <ActionForm onSubmit={form => onSave({ status: form.get('status') })}>
    <label>Status<select name="status" defaultValue={booking.status}>
      <option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option>
    </select></label>
  </ActionForm>;
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const load = async () => {
    setError('');
    try {
      setDashboard(await api('/admin/dashboard'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (path, method, body) => {
    await api(path, { method, body: JSON.stringify(body) });
    await load();
  };
  const providers = (dashboard?.users || []).filter(user => user.role === 'provider' && user.active !== false);
  const stats = dashboard?.stats;

  return <main className="container admin-dashboard">
    <p className="eyebrow">SYSTEM OVERVIEW</p>
    <h1>Admin dashboard</h1>
    <Message error={error} />
    {busy && !dashboard && <p>Loading platform data…</p>}
    {stats && <>
      <div className="stats admin-stats">
        {[
          ['Customers', stats.customers], ['Providers', stats.providers],
          ['Hotels', `${stats.activeHotels} active / ${stats.hotels} total`],
          ['Room listings', stats.rooms], ['Hotel bookings', stats.hotelBookings],
          ['Tour packages', `${stats.activeTourPackages} active / ${stats.tourPackages} total`],
          ['Tour bookings', stats.tourBookings], ['Platform revenue', money(stats.revenue)]
        ].map(([label, value]) => <div className="card" key={label}><small>{label}</small><h2>{value}</h2></div>)}
      </div>

      <section className="admin-section card">
        <h2>Customers and providers</h2>
        <p className="muted">Change customer/provider roles or deactivate accounts. Provider accounts with active hotels must have those hotels reassigned or deactivated first.</p>
        {dashboard.users.map(user => <UserRow key={user._id} user={user}
          onSave={(id, body) => save(`/admin/users/${id}`, 'PATCH', body)} />)}
      </section>

      <section className="admin-section card">
        <h2>Hotels</h2>
        <details className="admin-item">
          <summary>Add hotel</summary>
          <HotelForm providers={providers} submitLabel="Create hotel" onSave={body => save('/hotels', 'POST', body)} />
        </details>
        {dashboard.hotels.map(hotel => <details className="admin-item" key={`${hotel._id}-${hotel.updatedAt}`}>
          <summary>{hotel.name} · {hotel.city} · {hotel.active === false ? 'Inactive' : 'Active'}</summary>
          <HotelForm hotel={hotel} providers={providers} onSave={body => save(`/hotels/${hotel._id}`, 'PATCH', body)} />
        </details>)}
      </section>

      <section className="admin-section card">
        <h2>Room listings</h2>
        <details className="admin-item">
          <summary>Add room listing</summary>
          <RoomForm room={{}} hotels={dashboard.hotels} submitLabel="Create room listing"
            onSave={({ hotel, ...body }) => save(`/rooms/hotel/${hotel}`, 'POST', body)} />
        </details>
        {dashboard.rooms.map(room => <details className="admin-item" key={`${room._id}-${room.updatedAt}`}>
          <summary>{room.hotel?.name || 'Unknown hotel'} · {room.name} · {room.active === false ? 'Inactive' : 'Active'}</summary>
          <RoomForm room={room} hotels={dashboard.hotels} onSave={body => save(`/rooms/${room._id}`, 'PATCH', body)} />
        </details>)}
      </section>

      <section className="admin-section card">
        <h2>Hotel bookings</h2>
        {dashboard.bookings.map(booking => <div className="admin-row" key={booking._id}>
          <div>
            <b>{booking.bookingCode} · {booking.hotel?.name || 'Hotel unavailable'}</b>
            <small>{booking.guest?.name || 'Customer unavailable'} · {booking.room?.name || 'Room unavailable'}</small>
            <small>{new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()} · {money(booking.totalPrice)}</small>
          </div>
          <BookingStatusForm booking={booking}
            onSave={body => save(`/bookings/admin/${booking._id}`, 'PATCH', body)} />
        </div>)}
        {!dashboard.bookings.length && <p className="muted">No hotel bookings yet.</p>}
      </section>

      <section className="admin-section card">
        <h2>Tour packages</h2>
        <details className="admin-item">
          <summary>Add tour package</summary>
          <TourPackageForm providers={providers} submitLabel="Create package" onSave={body => save('/tours', 'POST', body)} />
        </details>
        {dashboard.tourPackages.map(tourPackage => <details className="admin-item" key={`${tourPackage._id}-${tourPackage.updatedAt}`}>
          <summary>{tourPackage.name} · {tourPackage.destination} · {tourPackage.provider?.name || 'Unassigned'} · {tourPackage.active === false ? 'Inactive' : 'Active'}</summary>
          <TourPackageForm providers={providers} tourPackage={tourPackage}
            onSave={body => save(`/tours/${tourPackage._id}`, 'PATCH', body)}
            onDelete={() => save(`/tours/${tourPackage._id}`, 'DELETE')} />
        </details>)}
      </section>

      <section className="admin-section card">
        <h2>Tour bookings</h2>
        {dashboard.tourBookings.map(booking => <div className="admin-row" key={booking._id}>
          <div>
            <b>{booking.bookingCode} · {booking.packageName}</b>
            <small>{booking.customer?.name || 'Customer unavailable'} · {booking.destination}</small>
            <small>{new Date(booking.travelDate).toLocaleDateString()} · {booking.travelers} traveler(s) · {money(booking.totalPrice)}</small>
          </div>
          <BookingStatusForm booking={booking}
            onSave={body => save(`/tour-bookings/admin/${booking._id}`, 'PATCH', body)} />
        </div>)}
        {!dashboard.tourBookings.length && <p className="muted">No tour bookings yet.</p>}
      </section>
    </>}
  </main>;
}
