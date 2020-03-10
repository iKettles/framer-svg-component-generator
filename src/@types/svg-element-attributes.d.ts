declare module 'svg-element-attributes' {
  interface SvgElementAttributes {
    [element: string]: string[];
  }

  const attributes: SvgElementAttributes;

  export = attributes;
}
