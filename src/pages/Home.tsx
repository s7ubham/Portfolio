import GameCanvas from '@components/GameCanvas'
import WelcomeOverlay from '@components/WelcomeOverlay'
import ProfilePanel from '@components/ProfilePanel'
import NameEntryOverlay from '@components/NameEntryOverlay'
import EndLinksOverlay from '@components/EndLinksOverlay'
import { useViewportSize } from '@hooks/useViewportSize'
import './Home.css'

function Home() {
  useViewportSize()

  return (
    <div className="home">
      <GameCanvas />
      <WelcomeOverlay />
      <NameEntryOverlay />
      <ProfilePanel />
      <EndLinksOverlay />
    </div>
  )
}

export default Home
