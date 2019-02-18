const imageUrl = __buildCloudinaryUrl("my-picture.jpeg", {
  transforms: {
    transformation: "crop",
    crop: "fill",
    quality: "auto:good",
    width: 200,
    height: 300,
  },
  prefix: null,
  postfix: undefined,
});
