<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public content (projects, reviews, services, site_content) is read via queryOptions in src/lib/content.ts and edited in /admin through RLS-protected browser writes; admin role lives in user_roles (first signup auto-admin) — keeps content out of code.
- Uploaded images go to the private `media` bucket and are stored as long-lived signed URLs, because public buckets are blocked for this workspace.
