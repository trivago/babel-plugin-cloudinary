const isMobile = false;
const bc = getBackgroundColor();
const clr = "lightblue";

__buildCloudinaryUrl("my-picture", {
  transforms: {
    transformation: [
      {
        effect: "cartoonify",
      },
      {
        radius: "max",
      },
      {
        effect: isMobile ? "outline:100" : "outline:200",
        color: clr,
      },
      {
        background: bc,
      },
      {
        height: 300,
        crop: getScale(),
      },
    ],
  },
});
