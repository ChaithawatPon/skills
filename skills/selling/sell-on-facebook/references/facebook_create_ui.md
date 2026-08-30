# Facebook create-item UI

Load this only when filling `marketplace/create/item`.

## Click exact labels. Never typeahead.

Type+Enter picks the first search hit (A4 run: "Household Items" → **Tools**, flyout stayed open, **Next stayed grey**).

| Skill field | Facebook click target |
| --- | --- |
| Good | `Used - Good` |
| Like New / Excellent | `Used - Like New` |
| Fair | `Used - Fair` |
| Household Items | `Household` under Home & Garden. If Next still grey, one retry click `Tools`, then fill `Used - Good` again (category change wipes condition). |
| Cameras | Scroll to and select `Electronics & computers`; Facebook does not expose a separate exact `Cameras` option in this form. |
| Product tags | combobox Product tags / แท็ก. Enter each JSON tag. Sure-check = 1-20 accepted chips; exact visible preview chips can confirm tags when the form reader misses them. |
| Location | combobox named exactly Location / ที่ตั้ง — not a "new login … location" bell |

Condition list: `New` · `Used - Like New` · `Used - Good` · `Used - Fair`.

After category/condition/tags click, press Escape and click Title so the flyout does not sit on Next.

Wait for listing photo thumbs after `setInputFiles` before judging Next. Fill the visible Description field under More details and read it back — preview text is not enough. Availability = `List as Single Item`. Public meetup and Hide from friends on. Boost off. Door pickup off. Public meetup checkbox is required before Next.

## Login

PATH C (`facebook-phase1`) may be logged out. Restore cookies from `~/.agent-browser/sessions/facebook-spy-facebook-spy.json`, reload once. If a login wall remains, stop. Do not open a new profile.

## One Chrome launch

If Next stays disabled, write `output/*-form-block.json` from `readRequiredFields` + one screenshot, then stop. Do not relaunch. Do not re-upload photos. Do not view every product image; metadata JSON + hook filename is enough.
