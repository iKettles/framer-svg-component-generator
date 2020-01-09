declare interface SvgDefinition {
  filename: string;
  path: string;
  svg: string;
  metadata: {
    name: string;
    asset?: string;
    description?: string;
    keywords?: string[];
    size?: string;
  };
}
