const deleteButtons = document.querySelectorAll("button.delete");

deleteButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!\nMake a backup if you think you will need this document later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Permanently Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/documents/${button.dataset.id}`, {
          method: "DELETE",
        }).then((response) => {
          if (response.ok) {
            Swal.fire(
              "Deleted!",
              "Your document has been deleted",
              "success",
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", "An error occurred; please try again", "error");
          }
        });
      }
    });
  });
});

const updateButtons = document.querySelectorAll("button.update");

updateButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();

    const index = button.dataset.index;
    const title = document.getElementById(`formName${index}`).value;
    const content = document.getElementById(`documentContent${index}`).value;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!\nMake a backup if you think you will need the old version later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#104fff",
      confirmButtonText: "Save Changes",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/documents/${button.dataset.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, content }),
        }).then((response) => {
          if (response.ok) {
            Swal.fire(
              "Saved!",
              "Your document has been updated",
              "success",
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", "An error occurred; please try again", "error");
          }
        });
      }
    });
  });
});

const contents = [...document.getElementsByClassName("documentContent")];

contents.forEach((content) => {
  content.value = content.dataset.content;
});
