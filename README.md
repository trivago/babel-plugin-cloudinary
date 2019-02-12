# babel-plugin-cloudinary

Compile cloudinary URLs at build time.

## API

### Globals

You can define the globals for your cloudinary URLs in a `.cloudinaryrc.json` that should be placed in the root of your project.

```json
{
  "native": {
    "cloud_name": "trivago",
    "secure": true
  },
  "overrideBaseUrl": true,
  "host": "trivago.images.com"
}
```

- **native** - these are directly passed into the `cloudinary-core` upon instantiation, you can use
  all the [configs in the official cloudinary API](https://cloudinary.com/documentation/solution_overview#configuration_parameters).
- **overrideBaseUrl** - set this to true if you want to override cloudinary default URL with the property **host**.
- **host** - a host to perform replace the default generated base URL (`res.cloudinary.com/trivago/image/upload`).

### \_\_buildCloudinaryUrl

```javascript
__buildCloudinaryUrl(assetName, options);
```

- **assetName** {string} **[mandatory]** - a string that represents the asset/image name.
- **options** {object} **[optional]** - the options object aggregates a series of optional parameters that
  you can feed in to the plugin in order to customize your URL.
- **options.transforms** {object} - these object are the cloudinary transformations to apply to the URL.
  For convince they will keep the same API as the [cloudinary-core image transformations](https://cloudinary.com/documentation/image_transformation_reference), these said you can check the official
  docs and use the `cloudinary-core` API directly.
- **options.prefix** {string} - a prefix string for you `assetName`.
- **options.postfix** {string} - a postfix string for you `assetName`.
- **options.resourceExtension** {string} - the resource extension (e.g. ".jpeg", ".png").

## Usage

### Install the plugin

> npm install babel-plugin-cloudinary

### Add the plugin to your .babelrc

```json
{
  "plugins": ["babel-plugin-cloudinary"]
}
```

### Use it in your code

```javascript
// gallery.js
function getImageUrl(imageName) {
  // compiles into "`${'https://res.cloudinary.com/<cloud_name>/image/upload/'}${imageName}${'.jpeg'}`;"
  return __buildCloudinaryUrl(imageName, {
    transforms: {
      width: 250,
      height: 250,
    },
    resourceExtension: ".jpeg",
  });
}
```

### TODO

- [ ] Documentation about creating typescript interfaces for plugin integration;
