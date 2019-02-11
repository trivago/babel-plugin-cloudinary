const imageUrl = __buildCloudinaryUrl("my-picture", {
  transforms: {
    transformation: "crop",
    crop: "fill",
    quality: "auto:good",
    width: 200,
    height: 300,
  },
  prefix: "gallery/sand/",
  postfix: "_v10",
  resourceExtension: ".png",
});
