import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

console.log("GSAP Scroll Demo Initialized");

const section = document.getElementById("featured-work-section");
const contentColumn = document.querySelector(".content-column");
const titlesList = document.querySelector(".titles-list");
const titles = document.querySelectorAll(".client-title");
const items = document.querySelectorAll(".work-item");
const progressFill = document.querySelector(".progress-fill");
const titlesColumn = document.querySelector(".titles-wrapper");

// Function to center the active title
const updateTitles = (index) => {
  titles.forEach((title, i) => {
    if (i === index) {
      title.classList.add("active");
    } else {
      title.classList.remove("active");
    }
  });

  // Calculate the position to center the active item
  // defined as: center of column - center of item relative to list
  // But we move the list, so:
  // Offset = (ColumnHeight / 2) - (TitleOffsetTop + TitleHeight / 2)

  const activeTitle = titles[index];
  if (!activeTitle) return;

  const columnHeight = titlesColumn.offsetHeight;
  const titleTop = activeTitle.offsetTop;
  const titleHeight = activeTitle.offsetHeight;

  const targetY = columnHeight / 2 - (titleTop + titleHeight / 2);

  gsap.to(titlesList, {
    y: targetY,
    duration: 0.5,
    ease: "power2.out",
  });
};

// Calculate total scroll amount needed
// We can use a timeline to control everything.

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: () => `+=${contentColumn.scrollHeight}`, // Pin for the duration of the content height
    pin: true,
    scrub: 1, // Smooth interaction
    anticipatePin: 1,
  },
});

// Animate the content column moving up
tl.to(contentColumn, {
  y: () =>
    -(
      contentColumn.scrollHeight -
      document.querySelector(".anim-container").offsetHeight
    ),
  ease: "none",
});

// Calculate the progress thresholds for each title group
// Group 0: items 1-4 (4 items), Group 1: 5-6 (2), Group 2: 7 (1), Group 3: 8 (1)
// Heights: each item 80vh, gap 10vh
const itemHeight = 80; // vh, but we'll use ratios
const gapHeight = 10;
const groups = [
  { count: 4, height: 4 * itemHeight + 3 * gapHeight }, // 350
  { count: 2, height: 2 * itemHeight + 1 * gapHeight }, // 170
  { count: 1, height: 1 * itemHeight }, // 80
  { count: 1, height: 1 * itemHeight }, // 80
];
const totalContentHeight = groups.reduce((sum, g) => sum + g.height, 0); // 350+170+80+80=680? Wait, 8 items, 7 gaps: 8*80 + 7*10 = 640+70=710
// Wait, groups[0]: 4 items, 3 gaps: 320+30=350
// groups[1]: 2 items, 1 gap: 160+10=170
// groups[2]: 1 item, 0 gap: 80
// groups[3]: 1 item, 0 gap: 80
// Total: 350+170+80+80=680, but earlier calculation 710? Wait, between groups there are gaps too? No, the gaps are between items, so for 8 items, 7 gaps, yes 710.
// But in groups, the gaps between groups are included in the next group's gaps? No, the content-column has gap: 10vh between all work-item, so yes, 7 gaps for 8 items.
// But in my groups, for group0: 3 gaps, group1:1 gap, group2:0, group3:0, total gaps 4, but should be 7. Mistake.
// The gaps are between all items, so for 4 items in group0, 3 gaps, then between group0 and group1, there is a gap, so group1 has 1 gap for its 2 items, but the gap between groups is the gap between last of group0 and first of group1, which is included in the 7.
// No, the gap is between consecutive work-item, so for items 1-2,2-3,3-4,4-5,5-6,6-7,7-8, yes 7 gaps.
// So groups[0] has gaps between 1-2,2-3,3-4, so 3 gaps.
// groups[1] has gap between 5-6, 1 gap.
// groups[2] no gap.
// groups[3] no gap.
// Total gaps 3+1=4, but should be 7. Missing the gaps between groups.
// The gap between 4 and 5 is the gap between group0 and group1, but in CSS, gap is between all siblings, so it's included.
// But in calculation, total height = sum item heights + sum gaps = 8*80 + 7*10 = 710, yes.
// For group heights, group0 height = 4*80 + 3*10 = 350, but this includes the gaps within group, but the total is 710, so the remaining is for between groups? No, the gaps are all included in the flex gap.
// So the height of content-column is sum of item heights + 7*gap.
// To find the position where group ends, the end of group0 is after 4 items + 3 gaps = 350vh from top.
// Then group1 starts after that, but since gap between 4 and 5 is included in the 3? No, the 3 gaps are 1-2,2-3,3-4, the gap 4-5 is separate.
// Wait, mistake: for 8 items, gaps are between 1-2,2-3,3-4,4-5,5-6,6-7,7-8, so 7 gaps.
// For group0: items 1,2,3,4, gaps 1-2,2-3,3-4, so 3 gaps, height = 4*80 + 3*10 = 350
// Then the next gap is 4-5, which is between group0 and group1, so the start of group1 is at 350 + 10 = 360vh from top.
// Then group1: items 5,6, gap 5-6, height = 2*80 + 1*10 = 170, so end of group1 at 360 + 170 = 530vh
// Then gap 6-7, start of group2 at 530 + 10 = 540vh
// Group2: 80vh, end at 540 + 80 = 620vh
// Gap 7-8, start of group3 at 620 + 10 = 630vh
// Group3: 80vh, end at 710vh
// Yes, that makes sense.
// So to calculate the progress where each group ends.
// The scroll distance is contentHeight - containerHeight = 710 - 80 = 630vh
// So progress = scrolled / 630
// End of group0: at 350vh scrolled, progress = 350/630 ≈ 0.556
// End of group1: at 530vh scrolled, progress = 530/630 ≈ 0.841
// End of group2: at 620vh scrolled, progress = 620/630 ≈ 0.984
// End of group3: at 710vh, but since scroll ends at 630, progress 1
// So, title 0 active from 0 to 0.556
// Title 1 from 0.556 to 0.841
// Title 2 from 0.841 to 0.984
// Title 3 from 0.984 to 1

// So, let's define the thresholds
const thresholds = [0.556, 0.841, 0.984, 1];

// Use onUpdate to change titles based on progress
tl.eventCallback("onUpdate", () => {
  const progress = tl.progress();
  let activeIndex = thresholds.length - 1; // default to last
  for (let i = 0; i < thresholds.length; i++) {
    if (progress < thresholds[i]) {
      activeIndex = i;
      break;
    }
  }
  updateTitles(activeIndex);
  progressFill.style.width = progress * 100 + "%";
});

// Remove the individual ScrollTriggers for items
// items.forEach((item) => {
//   ScrollTrigger.create({
//     trigger: item,
//     containerAnimation: tl,
//     start: "top center",
//     end: "bottom center",
//     onToggle: (self) => {
//       if (self.isActive) {
//         const titleIndex = parseInt(item.dataset.titleIndex, 10);
//         updateTitles(titleIndex);
//       }
//     },
//   });
// });

// Ensure first title is active on load
updateTitles(0);
