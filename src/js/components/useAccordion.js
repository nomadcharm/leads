const accTriggers = document.querySelectorAll(".accordion__trigger");

accTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    trigger.nextElementSibling.classList.toggle("active");
    trigger.classList.toggle("active");

    accTriggers.forEach((otherTrigger) => {
      const content = otherTrigger.nextElementSibling;
      if (otherTrigger !== trigger && content.classList.contains("active")) {
        content.classList.remove("active");
        otherTrigger.classList.remove("active");
      }
    });
  })
});
