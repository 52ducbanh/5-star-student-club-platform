import { HeroSection } from '../sections/Hero/HeroSection'
import { AboutSection } from '../sections/About/AboutSection'
import { CriteriaSection } from '../sections/Criteria/CriteriaSection'
import { ActivitiesSection } from '../sections/Activities/ActivitiesSection'
import { FaqSection } from '../sections/Faq/FaqSection'
import { ContactSection } from '../sections/Contact/ContactSection'

export function HomePage() {
  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <HeroSection />
      <AboutSection />
      <CriteriaSection />
      <ActivitiesSection />
      <FaqSection />
      <ContactSection />
    </main>
  )
}
