const imageUrl = __buildCloudinaryUrl("my-picture", {
  transforms: {
    transformation: "crop",
    crop: "fill",
    quality: "auto:good",
    width: 200,
    height: 300,
  },
});
