const renderChild = (fCate) => {
  const cateId = $("#fCategory").find(":selected").val();
  const category = $("#category");
  category.empty();

  for (const i of fCate) {
    if (i.id === cateId) {
      for (j of i.children) {
        $("#category").append(
          $("<option>", {
            value: j.id,
            text: j.categoryName,
          })
        );
      }
    }
  }
};

$(".image button").on("click", function () {
  this.parentNode.remove();
});

function deleteP() {}

$("#files").on("change", function (event) {
  const files = event.target.files;

  for (const i of files) {
    const url = URL.createObjectURL(i);
    const div = $("<div>", {
      class: "image",
    });
    const img = $("<img>", {
      src: url,
      alt: i.name,
    });
    const button = $("<button>", {
      type: "button",
      text: "X",
    });

    div.append(img, button);

    $(".book-image-display").append(div);
  }

  $(".image button").on("click", function () {
    this.parentNode.remove();
  });
});

$(() => {
  $("#files").fileinput({ theme: "fa6" });
});
