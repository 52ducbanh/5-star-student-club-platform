import { HeroSection } from '../sections/Hero/HeroSection'
import { AffiliationMarquee } from '../components/AffiliationMarquee'
import { AboutSection } from '../sections/About/AboutSection'
import { CriteriaSection } from '../sections/Criteria/CriteriaSection'
import { StarprintShowcaseSection } from '../sections/StarprintShowcase/StarprintShowcaseSection'
import { ActivitiesSection } from '../sections/Activities/ActivitiesSection'
import { FaqSection } from '../sections/Faq/FaqSection'
import { ContactSection } from '../sections/Contact/ContactSection'

export function HomePage() {
  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <HeroSection />
      <AffiliationMarquee />
      <AboutSection />
      <CriteriaSection />
      <StarprintShowcaseSection />
      <ActivitiesSection />
      <FaqSection />
      <ContactSection />
    </main>
  )
}
