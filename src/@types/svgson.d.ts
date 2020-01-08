declare module 'svgson' {
  function parse(input: any): Promise<ParsedSvg>;
  function stringify(input: any): Promise<any>;
}

declare interface ParsedSvg {
  children: any[];
}
