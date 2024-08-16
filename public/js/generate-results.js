const textarea = document.getElementById("documentContent");

textarea.value = textarea.dataset.content.trim();

document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    const text = textarea.value;

    const blob = new Blob([text], { type: "text/plain" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "download.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
