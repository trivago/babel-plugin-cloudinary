const myPicture = "my-picture";
const isMobile = false;
const getWidth = () => 200;
const getHeight = () => 300;
const imageQuality = isMobile ? "auto:eco" : "auto:good";
const pref = "gallery/sand/";
const post = "_v10";
const extMobile = ".png";
const extDesktop = ".jpeg";

const imageUrl = __buildCloudinaryUrl(myPicture, {
  transforms: {
    transformation: "crop",
    crop: "fill",
    quality: imageQuality,
    width: getWidth(),
    height: getHeight(),
  },
  prefix: pref,
  postfix: post,
  resourceExtension: isMobile ? extMobile : extDesktop,
});
