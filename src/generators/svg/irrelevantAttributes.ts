export default function removeIrrelevantAttributes(
  parsedSvgChild: ParsedSvgChild
) {
  const svgChildCopy = { ...parsedSvgChild };

  if (svgChildCopy.attributes.hasOwnProperty('fill')) {
    delete svgChildCopy.attributes.fill;
  }

  if (svgChildCopy.children.length > 0) {
    svgChildCopy.children = svgChildCopy.children.map(
      removeIrrelevantAttributes
    );
  }

  return svgChildCopy;
}
