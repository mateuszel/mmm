# Error Codes

## Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "constraints": {
      "descriptor": "validation_required"
    }
  }
}
```

---

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success |
| `400` | Bad Request — invalid syntax or validation error |
| `401` | Unauthorized — missing or invalid signature/key |
| `404` | Not Found — resource does not exist |

---

## Error Codes

| Code | Description |
|------|-------------|
| `internal_error` | Unexpected server error |
| `not_found` | Resource not found (invalid UUID, etc.) |
| `bad_request` | Invalid request syntax |
| `validation_error` | Data fails validation (see constraints) |
| `unauthorized` | Missing or invalid authentication |

## Validation Constraint Codes

Returned in the `constraints` object within a `validation_error`:

| Code | Description |
|------|-------------|
| `validation_required` | Field is missing or empty |
| `validation_nil_or_not_empty_required` | Field must not be null or empty |
| `validation_length_too_long` | Exceeds maximum length |
| `validation_length_too_short` | Below minimum length |
| `validation_length_invalid` | Wrong exact length |
| `validation_length_out_of_range` | Outside allowed range |
| `validation_length_empty_required` | Must be empty but isn't |
| `validation_is_email` | Invalid email format |
| `validation_is_digit` | Contains non-digit characters |
| `validation_is_uuid` | Invalid UUID format |
| `validation_in_invalid` | Value not in allowed set |
| `validation_status_invalid` | Resource status unsuitable for operation |
