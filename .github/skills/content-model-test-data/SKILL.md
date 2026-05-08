---
name: content-model-test-data
description: 'Generate schema-aware JSON test data from a provided content model. Use when you need min/max/type-valid mock content, industry-specific realism inferred from project context, and machine-ingestible output for downstream automation agents.'
argument-hint: 'Content model/schema + optional project context + desired record count'
user-invocable: true
distribute: true
---

# Content Model Test Data Generation

Generate realistic, client-friendly synthetic test content that strictly follows a provided generic JSON content model and is safe for programmatic ingestion by downstream agents.

## When to Use

- You have a content model and need valid sample data quickly.
- You need data that respects field constraints (type, min/max, required, enums, formats).
- You want domain-relevant data based on project context (for example, healthcare, ecommerce, finance).
- You need output as clean JSON for automated import pipelines.

## Inputs

Provide:

- Content model definition as generic JSON field specifications
- Desired number of records
- Optional project context (README snippets, app purpose, domain hints)
- Optional locale, tone, and deterministic seed
- If a seed is provided, generation must be repeatable for the same inputs.
- If no seed is provided, generation may vary across runs.

## Bundled Resources

- Example JSON output: [example-output.json](./references/example-output.json)
- Digital badge block model example: [digital-badge-block-model.json](./references/digital-badge-block-model.json)
- Digital badge block output example: [digital-badge-block-output.json](./references/digital-badge-block-output.json)
- Output envelope validator: [validate-output-envelope.ps1](./scripts/validate-output-envelope.ps1)

## CMS Table Normalization

If input comes from CMS property tables, normalize property types to generic JSON types before generation.

- String -> `string`
- Basic Rich Text -> `richText`
- Checkbox -> `boolean`

Keep original property names, required flags, translatable flags, defaults, and helper text as field metadata.

## Output Contract (Required)

Return JSON only (no prose, no markdown fences) using this envelope:

```json
{
  "meta": {
    "industry": "string",
    "industrySource": "inferred|provided|generic-default",
    "recordCount": 0,
    "modelName": "string",
    "generatedAt": "ISO-8601",
    "notes": []
  },
  "records": []
}
```

Rules:

- `records` must validate against the provided model.
- Keep field names exactly as defined by the model.
- Use values within min/max bounds and accepted formats.
- If context is missing, set industry to `generic-business`.
- Optional fields should be represented with a mixed strategy: omitted in some records and `null` in others.
- Do not include explanatory text outside JSON.

## Procedure

1. Normalize the model.
   - Parse each field from generic JSON specs: type, required, enum/options, min/max, pattern, format, nested objects/arrays.
   - Build a generation plan per field with validation constraints.

2. Infer industry.
   - Prioritize explicit user-provided industry hints when present.
   - Else infer from project context (repository docs, naming, feature language).
   - Else default to `generic-business`.

3. Build value strategies by field type.
   - String: honor minLength/maxLength/pattern/format.
   - Number/Integer: honor minimum/maximum and precision.
   - Boolean: include realistic true/false variation.
   - Enum: sample valid options only.
   - Date/DateTime: produce valid ISO values and realistic timelines.
   - Object/Array: recursively satisfy child constraints and item counts.

4. Apply realism layer.
   - Map generated values to the inferred industry vocabulary.
   - Keep internal consistency (for example, status and timestamps align).
   - Use synthetic mock values only; keep them sensible and client friendly.

5. Generate records.
   - Produce the requested count.
   - Ensure every required field is present.
   - Apply mixed optional-field handling with configurable sparsity percentages:
     - Omit some optional fields.
     - Set some optional fields to `null`.
     - Populate remaining optional fields with valid values.

6. Validate before returning.
   - Check each record against all constraints.
   - Regenerate invalid fields/records until valid.
   - Return JSON envelope only.

7. Optionally validate the envelope with the bundled script.
   - Run: `powershell -ExecutionPolicy Bypass -File ./scripts/validate-output-envelope.ps1 -InputPath ./output.json`
   - Ensure `meta.recordCount` matches `records` length.

## Decision Logic

- If model constraints conflict (for example `min > max`):
  - Return JSON with empty `records` and a note in `meta.notes` describing the conflict.
- If industry inference confidence is low:
  - Use `generic-business` and set `industrySource` to `generic-default`.
- If both user hint and inferred project industry exist:
   - Use the user hint and set `industrySource` to `provided`.
- If requested count is omitted:
  - Default to `10`.
- If seed is provided:
   - Use deterministic generation so outputs are reproducible.

## Quality Gates

A result is complete only if all are true:

- 100% of generated records conform to declared types and bounds.
- Required fields are never missing.
- Enum and pattern-constrained fields contain only valid values.
- Output is strict JSON, parseable without cleanup.
- `meta.industry` and `meta.industrySource` are populated.
- Optional fields follow the mixed omit/null strategy according to configured sparsity.

## Example Prompt

`Generate 25 records from this content model. Infer industry from the project context. Return JSON only in the required envelope.`
