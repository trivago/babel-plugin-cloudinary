function getUrl() {
  const myPicture = "my-picture";
  const baseQuality = "auto";
  const baseRadius = 20;

  return __buildCloudinaryUrl(myPicture + `.jpeg`, {
    transforms: {
      transformation: "crop",
      crop: "fill",
      quality: `${baseQuality}:${isMobile() ? "eco" : "best"}`,
      width: 333,
      height: 333,
      drp: "2.0",
      radius: baseRadius + ":" + "0:25:25",
    },
  });
}
