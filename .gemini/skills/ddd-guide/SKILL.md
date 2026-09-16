---
name: ddd-guide
description: >-
  Use this skill when deciding whether to create an Entity, Value Object, Aggregate Root, Domain Event, or Enum. Provides a pragmatic DDD decision matrix following YAGNI principles for this Clean Showcase project.
---

# Domain-Driven Design (DDD) Guide

## 1. Philosophy
- This project follows **Pragmatic DDD** with **YAGNI**
- Start simple, add complexity only when genuinely needed
- No enterprise bloat: no unnecessary abstractions, no premature patterns
- The domain layer has ZERO dependencies — pure C#

## 2. Decision Matrix

| Building Block | Identity? | Mutable? | When to Use | Implementation | Example |
|---------------|-----------|----------|-------------|----------------|---------|
| **Entity** | ✅ Yes (Guid) | ✅ Yes | Has a unique identity that persists across state changes, has a lifecycle | Inherit from `BaseEntity`, private setters, behavior methods | `Product`, `Order`, `User` |
| **Value Object** | ❌ No | ❌ No | Defined entirely by its properties, two instances with same values are equal, immutable | Use C# `record` (NOT an abstract ValueObject class) | `Money(decimal Amount, string Currency)`, `Address(string Street, string City)`, `Email(string Value)` |
| **Enum** | ❌ No | ❌ No | Fixed, finite set of domain-meaningful options that rarely change | Standard C# `enum` in `Domain/Enums/` | `OrderStatus`, `PaymentMethod`, `ProductCategory` |
| **Aggregate Root** | ✅ Yes | ✅ Yes | Entity that owns and manages child entities; child entities must ONLY be modified through the root | Inherit from `BaseEntity` (or create `AggregateRoot : BaseEntity` when needed), contains `List<ChildEntity>` | `Order` owns `OrderItem`s — you never save an OrderItem independently |
| **Domain Event** | N/A | N/A | When an action in one aggregate needs to trigger side effects in another aggregate or external system | Implement `INotification` (MediatR) or custom `IDomainEvent` when needed | `OrderPlacedEvent` → triggers email notification |

## 3. Decision Flowchart

```
Is it a concept with a unique identity that changes over time?
  ├─ YES: Does it own/manage other entities that can't exist independently?
  │   ├─ YES: It's an AGGREGATE ROOT → Create when you actually have child entities
  │   └─ NO:  It's an ENTITY → Inherit from BaseEntity
  └─ NO: Is it a fixed set of named options?
      ├─ YES: It's an ENUM → Place in Domain/Enums/
      └─ NO: Is it defined purely by its values (no identity)?
          ├─ YES: It's a VALUE OBJECT → Use a C# record
          └─ NO: Reconsider the design
```

## 4. Practical Rules for This Project

**Entities:**
- ALL entities inherit from `BaseEntity` (provides `Guid Id`)
- Private setters on all properties
- Constructor validates invariants (throws on invalid input)
- Behavior methods for state changes (e.g., `product.SetPrice(newPrice)`)
- NO public setters ever
- Place in `Domain/Entities/`

**Value Objects:**
- Use C# `record` directly — do NOT create an abstract `ValueObject` base class
- Records automatically get structural equality (what value objects need)
- Example: `public record Money(decimal Amount, string Currency);`
- Add validation in a static factory method if needed:
```csharp
public record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;
    
    public static Result<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
            return Error.Validation("Email.Invalid", "Email is invalid.");
        return new Email(value);
    }
}
```
- Value objects can be stored as owned types in EF Core

**Enums:**
- Standard C# `enum` is sufficient — do NOT use SmartEnum libraries
- Place in `Domain/Enums/`

**Aggregate Roots:**
- Do NOT create an `AggregateRoot` base class preemptively
- Start with simple entities. Only introduce aggregate root concept when:
  - You have parent-child entity relationships
  - Child entities have no meaning outside the parent
  - Business rules span parent + children
- When you need it: create `AggregateRoot : BaseEntity` with `List<IDomainEvent>` and `AddDomainEvent()` method

**Domain Events:**
- Do NOT add domain events infrastructure until you genuinely need cross-aggregate communication
- When ready, add `IDomainEvent : INotification` (MediatR) and dispatch events after SaveChanges
- Common mistake: adding events "because DDD says so" before you need them

## 5. Entity Error Convention
- Each entity gets its own static error class: `{Entity}Errors`
- Place alongside the entity in `Domain/Entities/`
- Use factory methods for errors with parameters, static readonly fields for simple errors
```csharp
public static class OrderErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("Order.NotFound", $"Order '{id}' not found.");
    public static readonly Error AlreadyCancelled = Error.Conflict("Order.AlreadyCancelled", "Order is already cancelled.");
}
```

## 6. Anti-Patterns to AVOID
- **Anemic Domain Model**: Entity with only getters/setters and no behavior. Put logic IN the entity.
- **Over-abstracting**: Creating `ValueObject`, `AggregateRoot`, `IDomainEvent`, `IRepository<T>` base classes before you need them.
- **Premature Aggregate Boundaries**: Making everything an aggregate root "just in case."
- **God Entity**: One entity with 30+ properties — split into smaller entities or value objects.
- **Shared Kernel Overuse**: Don't create a shared kernel project for 2 enums.

## 7. When to Evolve the Domain

| Trigger | Action |
|---------|--------|
| Need parent-child entity relationship | Introduce aggregate root pattern |
| Side effect needed after domain action | Add domain events |
| Complex multi-property concept (Address, Money) | Extract to value object (record) |
| Behavior scattered across handlers | Move logic into the entity |
| String/int used for constrained value (email, phone) | Extract to value object with validation |
