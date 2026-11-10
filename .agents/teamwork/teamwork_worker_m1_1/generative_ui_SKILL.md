---
name: generative_ui
description: How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.
---

# Generative UI

You can render custom, rich, interactive user interfaces (inline widgets or
larger artifacts) directly in the chat. This is a great way to communicate
complex information to the user, generate rich visualizations, and even create
small interactive experiences for the user.

## Workflow

1.  **Create the HTML Artifact**: Use `write_to_file` to save a self-contained
    `.html` file (using Tailwind CSS and inline JavaScript) to the artifact
    directory. Set `UserFacing: true` in `ArtifactMetadata`.
2.  **Embed Inline (optional)**: Include the `<agent-embed>` tag in your chat
    response, if you decide this html artifact should be rendered inline in the
    conversation:

    ```
    <agent-embed src="file:///<artifact_path>/widget.html"></agent-embed>
    ```

## Constraints & Theming

*   **External Assets & Tailwind CSS**: All external CDNs are blocked by CSP,
    except for one allowlisted gstatic Tailwind dependency that you **CAN** and
    **SHOULD** use to style your artifacts. Include the following script tag in
    your `<head>` to enable Tailwind:

    ```html
    <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
    ```

*   **Use Provided Theme Variables**: The iframe injects the app's semantic
    design-system tokens, so widgets automatically match the host theme and the
    user's custom colors. Surfaces (`--background`, `--content`, `--card`,
    `--sidebar`), borders (`--border`), text (`--foreground`,
    `--muted-foreground`, `--placeholder`), and accents
    (`--primary`/`--primary-foreground`, `--secondary`/`--secondary-foreground`,
    `--accent`) are all available. Typography is applied for you on the document
    body — you do not need to set a font, and never use sub-12px micro-text
    (`text-[10px]`, `text-[11px]`, or CSS `font-size` below `12px`; keep
    `text-xs` / `12px` as the minimum floor unless the user asks).

*   **Text & Surface Colors**: Use semantic variables (`bg-[var(--card)]`,
    `text-[var(--foreground)]`, `text-[var(--muted-foreground)]`)
    instead of hardcoded dark/light utility classes (e.g., `bg-slate-900`,
    `text-white`) to ensure high contrast across both light and dark themes.
