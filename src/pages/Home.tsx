import GameCanvas from '@components/GameCanvas'
import ProfilePanel from '@components/ProfilePanel'
import NameEntryOverlay from '@components/NameEntryOverlay'
import EndLinksOverlay from '@components/EndLinksOverlay'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <GameCanvas />
      <NameEntryOverlay />
      <ProfilePanel />
      <EndLinksOverlay />
    </div>
  )
}

export default Home
