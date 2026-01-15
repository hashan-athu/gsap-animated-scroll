/**
 * Splits the text content of an element into individual word spans.
 * Preserves the original text structure by ensuring appropriate spacing.
 * @param {HTMLElement} element The element containing text to split.
 * @param {string} wordClass Class name for the wrapper spans.
 */
export function splitTextIntoWords(element, wordClass = "word") {
  if (!element) return;

  const text = element.textContent.trim();
  const words = text.split(/\s+/);
  
  element.innerHTML = "";
  
  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.className = wordClass;
    span.style.display = "inline-block";
    
    // Add space after word if it's not the last one
    if (index < words.length - 1) {
       span.style.marginRight = "0.25em"; 
    }

    element.appendChild(span);
  });
  
  return element.querySelectorAll(`.${wordClass}`);
}
