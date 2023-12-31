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

$("#files").on("change", function (event) {
  const files = event.target.files;

  for (const i of files) {
    const readFile = new FileReader();
    readFile.onload = function (e) {
      const url = e.target.result;
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

      readFile.readAsDataURL(i);
    };
  }
});
