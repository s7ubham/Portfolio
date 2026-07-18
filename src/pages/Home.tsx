import GameCanvas from '@components/GameCanvas'
import ProfilePanel from '@components/ProfilePanel'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <GameCanvas />
      <ProfilePanel />
    </div>
  )
}

export default Home
