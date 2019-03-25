interface Options {
  transforms?: any,
  prefix?: string,
  postfix?: string,
  resourceExtension?: string,
}

export function __buildCloudinaryUrl(assetName: string, options?: Options) : string;
