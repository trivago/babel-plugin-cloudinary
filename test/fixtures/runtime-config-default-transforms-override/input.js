const imageUrl = __buildCloudinaryUrl("my-picture.jpeg", {
  transforms: {
    effect: "red:50",
    opacity: 30,
    quality: "auto:best", // will override default 'quality' in cloudinaryrc.json
  },
});
