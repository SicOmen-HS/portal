namespace Portal.Api.Contracts;

/// <summary>
/// Backend-owned description of a single dataset field. Mirrors the shape of the
/// frontend's DatasetFieldPreview model without depending on it.
/// </summary>
public sealed record DatasetFieldDto(
    string FieldName,
    string DataType,
    string Description,
    string ExampleValue);
