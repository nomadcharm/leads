const showBtn = document.querySelector(".cta__open-btn");
const closeBtn = document.querySelector(".cta__close-btn");
const text = document.querySelector(".cta__text-wrapper");

showBtn.addEventListener("click", () => {
  text.style.maxHeight = text.scrollHeight + "px";
  text.style.overflow = "hidden";
  showBtn.style.display = "none";
  closeBtn.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  text.style.maxHeight = "330px";
  text.style.overflow = "hidden";
  closeBtn.style.display = "none";
  showBtn.style.display = "block";
});
