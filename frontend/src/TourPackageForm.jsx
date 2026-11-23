import { useState } from 'react';
import { Message } from './components';

export function TourPackageForm({ tourPackage, providers, onSave, onDelete, submitLabel }) {
  const [facilities, setFacilities] = useState((tourPackage?.facilities || []).join(', '));
  const [itinerary, setItinerary] = useState((tourPackage?.itinerary || [])
    .map(item => `Day ${item.day} | ${item.title} | ${item.description || ''}`).join('\n'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get('name'),
      destination: form.get('destination'),
      description: form.get('description'),
      pricePerTraveler: Number(form.get('pricePerTraveler')),
      durationDays: Number(form.get('durationDays')),
      imageUrl: form.get('imageUrl'),
      facilities: facilities.split(',').map(value => value.trim()).filter(Boolean),
      itinerary: itinerary.split('\n').map((line, index) => {
        const [day, title, ...description] = line.split('|').map(value => value.trim());
        return {
          day: Number(day.replace(/^day\s*/i, '')) || index + 1,
          title: title || '',
          description: description.join(' | ')
        };
      }).filter(item => item.title)
    };

    if (providers) body.provider = form.get('provider') || null;
    if (tourPackage) body.active = form.get('active') === 'on';

    try {
      await onSave(body);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this tour plan from customer listings? Existing tour bookings will be retained.')) return;
    setError('');
    setBusy(true);
    try {
      await onDelete();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <form className="admin-edit-form" onSubmit={submit}>
    <h3>{tourPackage ? tourPackage.name : 'Add tour plan'}</h3>
    <label>Plan name<input name="name" required minLength="3" defaultValue={tourPackage?.name || ''} /></label>
    <label>Destination<input name="destination" required defaultValue={tourPackage?.destination || ''} /></label>
    <label>Description<textarea name="description" required defaultValue={tourPackage?.description || ''} /></label>
    <div className="admin-form-grid">
      <label>Price per traveler<input name="pricePerTraveler" type="number" min="0" step="1" required defaultValue={tourPackage?.pricePerTraveler ?? 0} /></label>
      <label>Duration (days)<input name="durationDays" type="number" min="1" step="1" required defaultValue={tourPackage?.durationDays ?? 1} /></label>
    </div>
    <label>Image URL<input name="imageUrl" defaultValue={tourPackage?.imageUrl || ''} /></label>
    {providers && <label>Provider<select name="provider" defaultValue={tourPackage?.provider?._id || tourPackage?.provider || ''}>
      <option value="">Unassigned</option>
      {providers.map(provider => <option key={provider._id} value={provider._id}>{provider.name} · {provider.email}</option>)}
    </select></label>}
    <label>Included facilities (comma separated)<input value={facilities} onChange={event => setFacilities(event.target.value)} /></label>
    <label>Itinerary (one line per day: Day | Title | Description)
      <textarea className="itinerary-editor" value={itinerary} onChange={event => setItinerary(event.target.value)} placeholder="Day 1 | Arrival | Check in and welcome dinner" />
    </label>
    {tourPackage && <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={tourPackage.active !== false} /> Visible to customers</label>}
    <Message error={error} />
    <div className="tour-form-actions">
      <button className="secondary" disabled={busy}>{busy ? 'Saving…' : submitLabel || 'Save plan'}</button>
      {tourPackage && onDelete && <button className="danger-button" type="button" disabled={busy} onClick={remove}>Delete tour plan</button>}
    </div>
  </form>;
}
