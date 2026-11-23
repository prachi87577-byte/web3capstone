# StayEasy project scope and data design

## Objective
Build a hotel room booking platform where guests can discover properties, check room availability for a date range, make and cancel bookings, and view booking history. Hotel managers maintain their own hotels and room types. Administrators access system-wide reporting.

## Actors
- Guest: browse, search, book, view and cancel own future bookings.
- Hotel Manager: create and manage own hotels and room types; view property booking/revenue report.
- Admin: system-wide report and management permissions.

## Collections and relationships
- User: identity, hashed password, role and refresh-token version.
- Hotel: belongs to a manager (`Hotel.manager -> User._id`).
- Room: belongs to a hotel (`Room.hotel -> Hotel._id`).
- Booking: references guest, hotel and room (`Booking.guest/hotel/room`).

## Main business rules
1. Check-out must be later than check-in.
2. Room availability uses overlap condition: `checkIn < requestedCheckOut` AND `checkOut > requestedCheckIn`.
3. Cancelled bookings do not consume inventory.
4. Capacity is `room.capacity × roomsBooked`.
5. Booking total = nights × price per night × number of rooms.
6. Guests can cancel only their own confirmed booking before check-in.
7. Manager can edit only hotels they own; admin has elevated access.

## Indexes and aggregation
- Unique index on User.email and Booking.bookingCode.
- Hotel city/active, Room hotel/price, Booking room/status/date range, Booking guest/date indexes.
- Manager revenue report groups confirmed/completed bookings by hotel.
- Admin report aggregates total revenue.

## ER-style relationship summary
`User 1 ── * Hotel 1 ── * Room 1 ── * Booking`
`User (guest) 1 ── * Booking`


### Roles
Customer: search, date availability, booking, booking history/cancellation.
Provider: add/manage hotels by country, state, city, locality and address; create room types, set prices/capacity/inventory; view bookings and revenue.
Admin: system-level reporting.

### Inventory rule
Availability is calculated for a date range by subtracting confirmed overlapping bookings from each room type's total inventory. The booking endpoint rechecks availability and rejects requests exceeding remaining inventory.
