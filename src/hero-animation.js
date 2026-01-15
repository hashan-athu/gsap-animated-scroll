import { gsap } from "gsap";
import { splitTextIntoWords } from "./utils/textUtils";

export function initHeroAnimation() {
  const headingContainer = document.querySelector(".main-heading h1");
  if (!headingContainer) return;

  const lines = headingContainer.querySelectorAll("span");
  if (lines.length < 2) return;

  const line1 = lines[0];
  const line2 = lines[1];

  // 1. Prepare Structure
  // Ensure lines handle overflow for the "reveal" effect
  gsap.set(lines, { overflow: "hidden" });
  
  // Split text into words
  const wordsLine1 = splitTextIntoWords(line1, "word-item");
  const wordsLine2 = splitTextIntoWords(line2, "word-item");

  // 2. Set Initial States
  // Line 1 words start DOWN (hidden below) so they move UP to 0
  gsap.set(wordsLine1, { yPercent: 100 });
  
  // Line 2 words start UP (hidden above) so they move DOWN to 0
  // "reveals from center invisible line" -> Center is between the two lines.
  // So Top line moves Up, Bottom line moves Down.
  // Wait, if Center is between them:
  // Top Line (Line 1) is above center. To reveal "from center", it should move FROM center (Down) TO Up.
  // Bottom Line (Line 2) is below center. To reveal "from center", it should move FROM center (Up) TO Down.
  
  // User request: "first line goes to up and and second line goes to down"
  // This implies the MOVEMENT direction.
  // First line moves UP. So it starts down (at the invisible center). Matches yPercent: 100 to 0.
  // Second line moves DOWN. So it starts up (at the invisible center). Matches yPercent: -100 to 0.
  
  gsap.set(wordsLine2, { yPercent: -100 });
  
  // Ensure visibility (in case CSS hid them)
  gsap.set(headingContainer, { autoAlpha: 1 });
  gsap.set([line1, line2], { visibility: "visible" }); // if needed

  // 3. Animation Timeline
  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });

  // Reveal Animation
  tl.add("start")
    .to(wordsLine1, {
      yPercent: 0,
      stagger: 0.05,
    }, "start")
    .to(wordsLine2, {
      yPercent: 0,
      stagger: 0.05,
    }, "start");

  // Post-reveal movement: First line moves right
  // "after the first line moves 24-42px right"
  // We can animate the whole line1 container or the words.
  // Moving the container is safer for layout.
  tl.to(line1, {
    x: 64, // Moving right
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.5"); // Overlap slightly with the end of reveal

    tl.call(() => {
        gsap.set(lines, { overflow: "visible" });
    });
}

// Auto-init if DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure styles are applied
    setTimeout(initHeroAnimation, 100);
});
