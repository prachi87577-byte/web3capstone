import { useEffect, useState } from 'react';
import { api } from './api';
import { Message } from './components';
import { TourPackageForm } from './TourPackageForm';

export function ProviderTours() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await api('/tours/mine');
      setPackages(data.packages);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (path, method, body) => {
    await api(path, { method, body: JSON.stringify(body) });
    await load();
  };

  return <main className="container">
    <p className="eyebrow">PROVIDER TOURS</p>
    <h1>Tour plans</h1>
    <p className="muted">Create plans for a destination. Active plans appear on the customer Tours page and can be booked by customers.</p>
    <Message error={error} />
    <section className="admin-section card">
      <TourPackageForm submitLabel="Add tour plan" onSave={body => save('/tours', 'POST', body)} />
    </section>
    <section className="admin-section card">
      <h2>Your tour plans</h2>
      {packages.length
        ? packages.map(tourPackage => <details className="admin-item" key={`${tourPackage._id}-${tourPackage.updatedAt}`}>
          <summary>{tourPackage.name} · {tourPackage.destination} · {tourPackage.active === false ? 'Hidden' : 'Visible to customers'}</summary>
          <TourPackageForm
            tourPackage={tourPackage}
            onSave={body => save(`/tours/${tourPackage._id}`, 'PATCH', body)}
            onDelete={() => save(`/tours/${tourPackage._id}`, 'DELETE')}
          />
        </details>)
        : <p className="muted">You haven’t added a tour plan yet.</p>}
    </section>
  </main>;
}
