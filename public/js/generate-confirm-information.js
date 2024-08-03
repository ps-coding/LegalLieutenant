const textareas = [...document.getElementsByTagName("textarea")];
textareas.forEach((textarea) => {
  textarea.value = textarea.dataset.content;
});

const paragraphs = [...document.getElementsByTagName("p")];
paragraphs.forEach((paragraph) => {
  paragraph.innerText = paragraph.dataset.content;
});

