namespace Showcase.Domain.Entities;

public static class TagErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("Tag.NotFound", $"Tag with ID '{id}' was not found.");

    public static Error NotFoundByName(string name) =>
        Error.NotFound("Tag.NotFoundByName", $"Tag '{name}' was not found.");

    public static readonly Error EmptyName =
        Error.Validation("Tag.EmptyName", "Tag name cannot be empty.");
}
