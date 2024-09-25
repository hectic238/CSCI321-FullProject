function EventCard({ event }) {
    return (
        <div className="event-card">
            <h2>{event.title}</h2>
            <p>{event.location}</p>
            <p>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
            <p>{event.additionalInfo}</p>
        </div>
    );
}

export default EventCard;
