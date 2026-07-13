# Keep

Keep is a small ritual tool for designing, beginning, and closing a weekly
screen-free Shabbat. It is built for culturally Jewish adults who may not
practice Shabbat, but want a calmer way to give the week a shape.

Live link: https://common-era-keep.pages.dev

## How It Was Made

The project used a written kernel as the source of truth. The kernel defined
the product laws, canonical copy, route contracts, data shape, visual tokens,
and lane ownership, so five parallel build lanes could move quickly without
rewriting one another's work.

The five lanes were:

- Ceremony: candle lighting, Havdalah, flame, and mosaic
- Intake: pledge design flow, local storage, and timing windows
- Artifact: shareable pledge card, PNG export, and calendar download
- Landing and shell: first screen, routing, PWA metadata, and deploy config
- Chronicle: sync digest, meeting notes, and decision history

Key challenges were keeping the tone gentle, making the Jewish structure feel
inviting rather than institutional, and preserving trust by avoiding accounts,
analytics, or device-usage tracking. The product stores only the user's pledge
and attested history in local storage on their own device.

With more time, the next pass would elevate the manuscript-inspired visual
system, add the video walkthrough, and explore a user-controlled dial for how
explicitly Jewish the experience feels.

## Deploy

```sh
npm run build
npx wrangler pages deploy dist --project-name common-era-keep
```
