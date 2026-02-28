import { useState } from 'react'
import './Timeline.css'

interface TimelineEvent {
  stage: string
  title: string
  description: string
  details: string
  icon: string
  color: string
  year?: string
  achievements?: string[]
}

const timelineEvents: TimelineEvent[] = [
  {
    stage: 'School',
    title: 'Foundation & Learning',
    description: 'Building core concepts and discovering passion for technology',
    details:
      'My educational journey began with a passion for computers and problem-solving. I explored programming languages, competed in coding competitions, and built my first projects. During these formative years, I discovered the power of technology to change the world.',
    icon: '📚',
    color: '#FF6B6B',
    year: '2010-2019',
    achievements: [
      'Learned fundamentals of computer science',
      'Competed in national coding competitions',
      'Built first web applications',
      'Developed strong problem-solving skills',
    ],
  },
  {
    stage: 'College',
    title: 'Advanced Skills & Innovation',
    description: 'Deepening technical expertise and exploring computer science',
    details:
      'In college, I elevated my technical skills to a professional level. I studied advanced algorithms, data structures, software engineering principles, and specialized in full-stack development. Collaborated with peers on complex projects and learned the importance of teamwork.',
    icon: '🎓',
    color: '#4ECDC4',
    year: '2019-2022',
    achievements: [
      'Mastered full-stack development',
      'Led team projects successfully',
      'Internships at tech companies',
      'Published research and articles',
    ],
  },
  {
    stage: 'Work',
    title: 'Professional Experience',
    description: 'Applying knowledge to real-world projects and solving problems',
    details:
      'Entered the professional world with determination to make an impact. Working with industry leaders taught me best practices, scalability, and the real-world challenges of software development. I delivered production-level systems, mentored junior developers, and contributed to significant projects.',
    icon: '💼',
    color: '#45B7D1',
    year: '2022-Present',
    achievements: [
      'Shipped production applications',
      'Mentored junior developers',
      'Led technical initiatives',
      'Solved complex architectural problems',
    ],
  },
  {
    stage: 'Projects',
    title: 'Creative Endeavors',
    description: 'Building amazing projects and pushing technical boundaries',
    details:
      'Outside of traditional work, I pursued passion projects that pushed my creativity and technical boundaries. These projects allowed me to explore emerging technologies, contribute to open-source, and build solutions that matter. Each project taught me invaluable lessons.',
    icon: '🚀',
    color: '#96CEB4',
    year: 'Ongoing',
    achievements: [
      'Built innovative web applications',
      'Contributed to open-source projects',
      'Created educational content',
      'Pioneered new technical approaches',
    ],
  },
]

function Timeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  const handleClose = () => {
    setSelectedEvent(null)
  }

  return (
    <section className="timeline-section">
      <div className="timeline-container">
        <h1 className="timeline-title">The Timeline Investigation</h1>
        <p className="timeline-subtitle">Click on each stage to uncover the full story</p>

        <div className="timeline-wrapper">
          <div className="timeline-horizontal">
            <div className="timeline-line" />
            <div className="timeline-events-container">
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`timeline-event timeline-event-${index}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div
                    className="timeline-dot"
                    style={{
                      borderColor: event.color,
                      boxShadow: `0 0 20px ${event.color}80, inset 0 0 20px ${event.color}40`,
                    }}
                  >
                    <span className="timeline-icon">{event.icon}</span>
                  </div>
                  <div className="timeline-label">
                    <h3 className="timeline-stage">{event.stage}</h3>
                    {event.year && <span className="timeline-year">{event.year}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>
              ✕
            </button>

            <div className="modal-header">
              <div className="modal-icon" style={{ color: selectedEvent.color }}>
                {selectedEvent.icon}
              </div>
              <div className="modal-title-section">
                <h1 className="modal-title">{selectedEvent.stage}</h1>
                <h2 className="modal-subtitle">{selectedEvent.title}</h2>
              </div>
              {selectedEvent.year && <div className="modal-year">{selectedEvent.year}</div>}
            </div>

            <div className="modal-body">
              <p className="modal-description">{selectedEvent.details}</p>

              {selectedEvent.achievements && selectedEvent.achievements.length > 0 && (
                <div className="modal-achievements">
                  <h3 className="achievements-title">Key Highlights:</h3>
                  <ul className="achievements-list">
                    {selectedEvent.achievements.map((achievement, idx) => (
                      <li key={idx} className="achievement-item">
                        <span className="achievement-marker" style={{ borderLeftColor: selectedEvent.color }}>
                          ▸
                        </span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-button" onClick={handleClose}>
                Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Timeline
