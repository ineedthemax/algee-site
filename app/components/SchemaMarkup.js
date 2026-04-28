// Renders JSON-LD schema markup in a <script> tag
// Usage: <SchemaMarkup schema={schemaObject} />
export default function SchemaMarkup({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
