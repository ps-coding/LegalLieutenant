const divs = [...document.getElementsByTagName("div")];
divs.forEach((el) => {
  el.innerText = el.dataset.content;
});

const paragraphs = [...document.getElementsByTagName("p")];
paragraphs.forEach((el) => {
  el.innerText = el.dataset.content;
});

function showSummary(e) {
  const element = e.target;

  const computedStyle = getComputedStyle(element);
  elementHeight = element.clientHeight;
  elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

  element.style.minHeight = elementHeight + "px";

  element.innerText = element.dataset.summary;
}

function hideSummary(e) {
  const element = e.target;
  element.innerText = element.dataset.content;
  element.style.minHeight = "auto";
}

function toggleSections() {
  const sections = [...document.getElementsByTagName("section")];
  sections.forEach((el) => {
    el.classList.toggle("hidden")
  })
}

function defineText() {
  const selection = window.getSelection().toString();
  const word = selection.split(" ")[0]
  if (word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          alert(data[0].meanings.map((val, index) => `${index + 1}. ${val.definitions[0].definition}`).join("\n"))
        }
      })
  }
}

document.onmouseup = defineText;
if (!document.all) document.captureEvents(Event.MOUSEUP);

