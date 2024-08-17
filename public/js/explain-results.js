let lastSelection = "";

const divs = [...document.getElementsByTagName("div")];
divs.forEach((el) => {
  el.innerText = el.dataset.content;
});

const titleH = document.getElementById("title");
titleH.innerText = titleH.dataset.formname;

const contentP = document.getElementById("content");
contentP.innerText = contentP.dataset.content;

function showSummary(e) {
  const element = e.target;

  const computedStyle = getComputedStyle(element);
  elementHeight = element.clientHeight;
  elementHeight -=
    parseFloat(computedStyle.paddingTop) +
    parseFloat(computedStyle.paddingBottom);

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
    el.classList.toggle("hidden");
  });
}

function defineText() {
  const selection = window.getSelection().toString();

  if (selection === lastSelection) {
    return;
  }

  lastSelection = selection;

  const words = selection.split(" ");

  if (words.length > 1) {
    return;
  }

  const word = words[0];

  if (word) {
    try {
      fetch(`/define/${word.trim().toLowerCase()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            return;
          }
          if (Array.isArray(data)) {
            Swal.fire({
              title: word.trim().toLowerCase(),
              html: data[0].meanings
                .map(
                  (val, index) =>
                    `${index + 1}. ${val.definitions[0].definition}`,
                )
                .join("<br />"),
              icon: "info",
              confirmButtonText: "Ok",
              confirmButtonColor: "#3c3c3c",
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  }
}

function saveDocument() {
  const titleH = document.getElementById("title");
  const contentP = document.getElementById("content");
  const title = titleH.dataset.formname;
  const content = contentP.dataset.content;

  fetch("/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  }).then((res) => {
    if (!res.ok) {
      Swal.fire({
        title: "Error",
        text: "An error occurred while saving the document",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#3c3c3c",
      });
    } else {
      Swal.fire({
        title: "Document Saved",
        text: "Document has been saved successfully",
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#3c3c3c",
      });
    }
  });
}

function download() {
  const formName = titleH.dataset.formname;
  const text = contentP.dataset.content;

  const fileName = formName.replaceAll(/[\/|\\:*?"<>\s]/g, "_");

  const blob = new Blob([text], { type: "text/plain" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.onmouseup = defineText;
if (!document.all) document.captureEvents(Event.MOUSEUP);
