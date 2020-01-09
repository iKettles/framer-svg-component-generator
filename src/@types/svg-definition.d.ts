declare interface SvgDefinition {
  filename: string;
  path: string;
  outputDirectory: string;
  relativeOutputDirectory: string;
  svg: string;
  metadata: {
    name: string;
    asset?: string;
    description?: string;
    keywords?: string[];
    size?: string;
  };
}
