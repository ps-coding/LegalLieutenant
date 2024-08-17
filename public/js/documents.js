const deleteButtons = document.querySelectorAll("button[data-id]");

deleteButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
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

const contents = [...document.getElementsByClassName("documentContent")];

contents.forEach((content) => {
  content.value = content.dataset.content;
});
