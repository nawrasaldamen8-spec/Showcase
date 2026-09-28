# Pority

## 1. Project Overview

**Pority** is a personal web presence platform that allows anyone to create and maintain a ready-made personal portfolio and professional profile on the web.

The core problem Pority solves is simple:

> People want a professional presence on the internet, but building and maintaining a personal website from scratch requires unnecessary time, technical knowledge, design work, hosting, and continuous maintenance.

Pority removes that burden.

A person creates an account, builds their profile, adds their work and career information, and receives a **public personal profile** that can be shared directly on the web.

Instead of:

```text
Person
   ↓
Design Website
   ↓
Build Website
   ↓
Buy / Configure Hosting
   ↓
Maintain Website
   ↓
Update Portfolio
```

Pority provides:

```text
Person
   ↓
Create Pority Profile
   ↓
Add Works + Career + About
   ↓
Share Profile
   ↓
Keep Updating It
```

Pority is therefore not simply a portfolio builder and not primarily a social network.

It is a **personal web presence platform centered around the person**.

---

# 2. Product Vision

Pority gives every person a simple and structured place on the web to represent:

* Who they are
* What they have created
* What they have done
* What they know
* What they have achieved
* How people can learn more about them

The product combines personal identity, work, and career information into one public profile.

The profile remains under the user's control and can evolve as their career and work evolve.

The fundamental idea is:

> **One person. One profile. One place for their identity, work, and career.**

---

# 3. The Core Product

The core of Pority is the **Public Profile**.

Every user has a public profile that can be accessed through a personal username URL.

For example:

```text
pority.com/u/username
```

The profile is publicly accessible.

A visitor does not need a Pority account to view it.

The profile represents the person through three primary areas:

```text
Profile
   │
   ├── Works
   ├── Career
   └── About
```

These three areas form the fundamental structure of a Pority profile.

---

# 4. Public Profile

The public profile begins with the person's identity.

It can contain:

* Profile image
* Name
* Username
* Specialization

The visitor can then navigate between:

### Works

The person's published work.

### Career

The person's professional and educational history.

### About

Personal information, biography, and external links.

The goal is not to create one extremely long portfolio page filled with every possible section.

Instead, Pority provides a clear structure that allows visitors to quickly understand:

> Who is this person?

> What have they made?

> What is their background?

---

# 5. Works

Works represent what the person has created.

A user can continuously publish work throughout their career.

A Work can contain information such as:

* Images
* Title
* Description
* External link
* Tags
* Publication state

The visual presentation of work is important.

Works should allow the creator to present projects, designs, photography, artwork, software, architecture, branding, or other professional/creative output.

The system is intentionally flexible regarding the type of work.

Pority is not limited to programmers or designers.

---

# 6. Studio

The **Studio** is the private workspace where a user manages their Works.

It is not the public portfolio.

The Studio allows users to:

* Create a Work
* Edit a Work
* Save drafts
* Publish Works
* Unpublish Works
* Archive Works
* Delete Works
* Search Works
* Filter Works
* Sort Works

A typical lifecycle is:

```text
Draft
  │
  ▼
Published
  │
  ├── Unpublished
  │
  └── Archived
```

The Studio makes the portfolio a continuously maintained system rather than a website that is created once and forgotten.

---

# 7. Career

Career represents the person's broader professional and educational record.

It goes beyond simply listing projects.

Career can contain areas such as:

* Experience
* Academics
* Skills
* Credentials
* Languages
* Achievements

The purpose is to allow someone to build a complete representation of their professional journey inside Pority.

For example, a person could have:

```text
Career
│
├── Experience
├── Academics
├── Skills
├── Credentials
├── Languages
└── Achievements
```

The exact career information depends on the person.

Pority provides the structure without forcing everyone to have the same career.

---

# 8. Career Visibility

Users control which Career areas are visible on their public profile.

For example:

```text
Experience     → Visible
Academics      → Visible
Skills         → Visible
Credentials    → Visible
Languages      → Hidden
Achievements   → Visible
```

This means Pority provides the available building blocks while the user decides how much of their career they want to present publicly.

The public profile should therefore reflect the individual rather than forcing every person into an identical template.

---

# 9. About

The About section represents the personal side of the profile.

It can contain:

* Biography
* Personal information
* Social links
* Other information the user chooses to share

The About section complements Works and Career.

Together:

```text
Works
→ What I have created

Career
→ What I have done

About
→ Who I am
```

---

# 10. Personal Identity

Every Pority profile has a recognizable personal identity.

This includes information such as:

* Profile image
* Name
* Username
* Specialization
* Bio
* Social links

The username also provides the user's public URL.

For example:

```text
pority.com/u/john
```

This URL can be shared directly with:

* Employers
* Clients
* Recruiters
* Friends
* Collaborators
* Anyone interested in the person's work

---

# 11. Public by Design

A Pority profile is intended to exist on the public web.

The visitor does not need to be logged in.

The owner can share their profile URL anywhere.

For example:

```text
"Check out my Pority profile."

pority.com/u/john
```

The visitor can then view the information that the user has chosen to make public.

This is fundamental to the product.

Pority is not a closed community where profiles only exist for registered users.

It provides a **public personal presence on the web**.

---

# 12. Discovery

Pority also provides a way for users to discover other people on the platform.

The discovery experience is centered around **people**, not simply content.

Users can:

* Search for people
* Discover profiles
* Open public profiles
* View their Works
* View their Career
* View their About information

Search can use information such as:

* Name
* Username
* Description
* Specialization

Discovery exists to make the people and their work on Pority accessible without turning the product into a traditional social network.

---

# 13. Social Layer

Pority contains a lightweight social layer around the personal portfolio.

Users can interact with other people's Works.

For example:

* Like a Work
* Visit another person's Profile
* Receive activity notifications

However, social interaction is not the primary purpose of the product.

The hierarchy is:

```text
Personal Presence
       ↓
Profile
       ↓
Works + Career + About
       ↓
Discovery
       ↓
Light Social Interaction
```

Not:

```text
Social Network
       ↓
Users
       ↓
Posts
```

This distinction is important to the product identity.

---

# 14. Likes

Users can like Works published by other users.

A like represents interaction with the work itself rather than a general social relationship between users.

For example:

```text
User A
   ↓
Views User B's Work
   ↓
Likes Work
   ↓
User B receives notification
```

---

# 15. Profile Visits

Pority can record profile visits.

When someone visits a user's public profile, the owner can receive a notification indicating that their profile was visited.

For example:

> Someone visited your profile.

The system can also provide the time associated with the activity.

This gives users visibility into activity around their public presence.

---

# 16. Notifications

Notifications provide feedback about activity involving the user's Pority profile.

They can include:

* Profile visits
* Likes on Works
* System notifications
* Administrative announcements or warnings

Notifications are therefore an activity layer around the personal profile.

---

# 17. Verification

Pority can provide account verification.

A user can submit a verification request.

The administrative system can:

* Review the request
* Approve it
* Reject it
* Add a review note

Approved accounts can display a verification status on their profile.

Verification is intended to provide an additional layer of trust around identities on the platform.

---

# 18. Admin Platform

Pority is also a platform that needs operational management.

The administrative side can provide functionality for:

* User management
* Verification management
* Reports
* Featured profiles
* Storage monitoring
* Audit logs
* System broadcasts
* Platform moderation

The Admin system exists to operate and moderate Pority.

It is not part of the core public-profile experience.

The product hierarchy is:

```text
Pority
│
├── User Experience
│   ├── Public Profile
│   ├── Works
│   ├── Career
│   ├── About
│   ├── Studio
│   ├── Discovery
│   ├── Notifications
│   └── Account
│
└── Platform Administration
    ├── Users
    ├── Verification
    ├── Reports
    ├── Storage
    ├── Audit
    └── Broadcasts
```

---

# 19. Desktop and Mobile

Pority is designed as one product with two intentionally different experiences.

Desktop and Mobile should not simply be the same interface scaled down.

Instead:

```text
              PORITY PRODUCT
                    │
          ┌─────────┴─────────┐
          │                   │
       Desktop             Mobile
       Experience          Experience
          │                   │
       Different            Different
       Layout               Layout
       Interaction          Interaction
       Navigation           Navigation
```

Both experiences use the same product concepts and data, but their layouts and interactions can be designed specifically for the device.

The Mobile experience should feel like a genuine mobile product rather than a compressed desktop website.

This also keeps the product architecture suitable for a potential future React Native implementation of the mobile experience.

---

# 20. What Pority Is Not

Pority is not primarily:

* A social network
* A traditional CV builder
* A LinkedIn replacement
* A Behance clone
* A generic website builder
* A blog platform
* A content management system
* A page builder requiring users to design their own website

It may contain functionality found in some of these products, but its central purpose is different.

Pority is centered around:

> **A person's identity, work, and career existing together in one ready-made public presence.**

---

# 21. The Problem Pority Solves

The problem can be summarized as:

> **"I want to have a professional presence on the internet that represents who I am, what I have done, and what I have created, without having to build and maintain a website myself."**

Today, a person may need to combine several different places:

```text
LinkedIn
→ Career

GitHub
→ Code

Behance
→ Design

Personal Website
→ Portfolio

Google Drive / Documents
→ Certificates / CV

Social Media
→ Personal Presence
```

Pority aims to provide a single personal destination.

```text
                    PORITY
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Identity         Works         Career
        │              │              │
      About         Projects      Experience
      Profile        Images       Academics
      Links          Details      Skills
      Username       Tags         Credentials
                                   Languages
                                   Achievements
```

The user can then share one URL.

---

# 22. The Core User Journey

The fundamental journey is:

```text
Create Account
      ↓
Build Identity
      ↓
Complete Profile
      ↓
Add Career
      ↓
Create Works
      ↓
Publish
      ↓
Receive Public Profile
      ↓
Share Profile
      ↓
Continue Updating
```

The important part is the last step.

Pority is not finished when the user creates their profile.

It is designed to grow with the person.

```text
Person
   ↓
Career changes
   ↓
New experience
   ↓
New skills
   ↓
New credentials
   ↓
New work
   ↓
Update Pority
```

---

# 23. Product Structure

At the highest level, Pority can be understood as:

```text
                         PORITY
                           │
                    Personal Presence
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           WORKS         CAREER        ABOUT
             │             │             │
         Projects      Experience       Bio
         Images        Academics        Identity
         Details       Skills           Links
         Tags          Credentials
         Links         Languages
                       Achievements
                           │
                           ▼
                    Public Profile
                           │
             ┌─────────────┴─────────────┐
             │                           │
        Anyone can view             Pority Users
                                         │
                              ┌──────────┼──────────┐
                              │          │          │
                           Search      Likes      Visits
                              │          │          │
                              └──────────┼──────────┘
                                         │
                                    Notifications
```

Alongside the public experience:

```text
Studio
  ↓
Manage Works

Admin
  ↓
Manage Platform
```

---

# 24. Product Principle

Pority should remain simple despite having many capabilities.

The product should not grow by continuously adding sections, pages, or social features simply because they are possible.

Every feature should answer a question related to the core purpose:

> **Does this help the person represent themselves, their work, or their career on the web?**

The public profile should remain the center of the product.

The goal is not to create the largest platform possible.

The goal is to create a **clear, useful, distinctive personal presence platform**.

---

# 25. Final Product Definition

**Pority is a personal web presence platform that gives every person a ready-made public profile where they can represent who they are, showcase what they have created, and present their professional and educational journey.**

It combines:

```text
Identity
   +
Works
   +
Career
   +
About
```

into one continuously updated public presence.

Users do not need to build a website from scratch.

They create their profile, add their information and work, control what they want to show, and share one public URL.

Pority then provides the infrastructure around that profile for managing Works, building a Career, discovering other people, and enabling lightweight interaction.

The central idea is:

> **Pority gives people a place on the web that represents them.**
