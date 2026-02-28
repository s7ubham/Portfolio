import './Timeline.css'

interface TimelineEvent {
  stage: string
  title: string
  description: string
  icon: string
  color: string
  year?: string
}

const timelineEvents: TimelineEvent[] = [
  {
    stage: 'School',
    title: 'Foundation & Learning',
    description: 'Building core concepts and discovering passion for technology',
    icon: '📚',
    color: '#FF6B6B',
    year: '2010-2016',
  },
  {
    stage: 'College',
    title: 'Advanced Skills & Innovation',
    description: 'Deepening technical expertise and exploring computer science',
    icon: '🎓',
    color: '#4ECDC4',
    year: '2016-2020',
  },
  {
    stage: 'Work',
    title: 'Professional Experience',
    description: 'Applying knowledge to real-world projects and solving problems',
    icon: '💼',
    color: '#45B7D1',
    year: '2020-Present',
  },
  {
    stage: 'Projects',
    title: 'Creative Endeavors',
    description: 'Building amazing projects and pushing technical boundaries',
    icon: '🚀',
    color: '#96CEB4',
    year: 'Ongoing',
  },
]

function Timeline() {
  return (
    <section className="timeline-section">
      <div className="timeline-container">
        <h1 className="timeline-title">My Journey</h1>
        <div className="timeline">
          <div className="timeline-line" />
          {timelineEvents.map((event, index) => (
            <div key={index} className={`timeline-event timeline-event-${index}`}>
              <div className="timeline-dot">
                <span className="timeline-icon">{event.icon}</span>
              </div>
              <div className="timeline-content" style={{ borderLeftColor: event.color }}>
                <div className="timeline-header">
                  <h2 className="timeline-stage">{event.stage}</h2>
                  {event.year && <span className="timeline-year">{event.year}</span>}
                </div>
                <h3 className="timeline-event-title">{event.title}</h3>
                <p className="timeline-description">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Timeline
