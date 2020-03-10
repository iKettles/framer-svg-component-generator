declare module 'svgson' {
  function parse(input: any): Promise<ParsedSvg>;
  function stringify(input: any): Promise<any>;
}

declare interface ParsedSvg {
  children: ParsedSvgChild[];
}

declare interface ParsedSvgChild {
  name: string;
  type: string;
  value: string;
  uniquePathName?: string;
  attributes: {
    [key: string]: string;
  };
  children: ParsedSvgChild[];
}
