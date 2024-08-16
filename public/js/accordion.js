function openOpenable(e) {
  e.parentElement.classList.toggle("open");
  if (e.parentElement.classList.contains("open")) {
    e.innerHTML = e.innerHTML.replace("▼", "▲");
  } else {
    e.innerHTML = e.innerHTML.replace("▲", "▼");
  }
}
