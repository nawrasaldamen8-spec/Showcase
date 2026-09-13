namespace Architecture.Domain.Common.BaseEntity;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; }

    protected BaseEntity(Guid id)
    {
        Id = id;
    }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
    }
}
