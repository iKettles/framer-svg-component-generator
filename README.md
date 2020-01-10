# Framer SVG Component Generator

A simple utility which takes a (nested) folder of SVGs and generates TypeScript React components with Framer Property Controls. It will also generate a `schema.json` file which contains parsed metadata about each SVG.

## Installation

`yarn global add framer-svg-component-generator`

## Usage

`framer-svg-component-generator ./icons ./components`

## Input

This utility will search recursively for .svg files within the given input directory.

## Output

### Generated Components

A component will be generated for each SVG this utility finds. Each component will have a [property control](https://www.framer.com/api/property-controls/) of `ControlType.Color` which controls the fill of the SVG.

### Icon Component

Alongside the individual components for each SVG, you'll also get a generic `<Icon/>` component with a property control that shows a dropdown of the available icons. The option titles match the nested structure of the original input directory to avoid duplicate icon names.

### Component Names

The filename of the generated components will match the name of the original SVG.

### Directory Structure

The generated components will adhere to the same structure as the input directory.

### Generated Schema

By default this utility will write a `schema.json` file to the root of the output directory. This schema provides a definition of each imported SVG with metadata parsed from the body of the SVG itself. The structure will look similar to the following:

```json
[
  {
    "id": "Circle",
    "metadata": {
      "name": "Circle",
      "asset": "Icon",
      "description": "A circle icon for testing",
      "keywords": ["Circle", "round"],
      "size": "16"
    }
  }
]
```

The `keywords` metadata is interpreted as a comma-separated list of keywords and parsed to a JSON array.
