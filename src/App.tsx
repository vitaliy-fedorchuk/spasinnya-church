import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import CommunitySection from "./components/sections/CommunitySection";
import EventsSection from "./components/sections/EventsSection";
import WelcomeSection from "./components/sections/WelcomeSection";
import MinistriesSection from "./components/sections/MinistriesSection";
import FaqSection from "./components/sections/FaqSection";
import NewsSection from "./components/sections/NewsSection";

function App() {
  return (
    <div className="App">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CommunitySection />
      <EventsSection />
      <WelcomeSection />
      <MinistriesSection />
      <FaqSection />
      <NewsSection />
      <Footer />
    </div>
  );
}

export default App;
