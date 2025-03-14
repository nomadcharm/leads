const videoArray = document.querySelectorAll(".video-clip");

videoArray.forEach((video) => {
  video.addEventListener("click", () => {
    video.play();
  });

  video.addEventListener("ended", () => {
    video.load();
  });
});
