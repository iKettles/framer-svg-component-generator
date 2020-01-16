declare interface SvgDefinition {
  filename: string;
  path: string;
  id: string;
  outputDirectory: string;
  relativeOutputDirectory: string;
  svg: string;
  metadata: SvgMetadata;
}

declare interface SvgMetadata {
  name: string;
  [key: string]: string | string[];
}
