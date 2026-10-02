# Merge smoke tests

## Track A — rooms and assignment
1. Log in as `admin@pgmanage.com` and open `/admin/rooms`.
2. Confirm the matrix total equals the seeded database bed count.
3. Assign an available bed to the no-bed resident.
4. Reload and confirm the bed and resident both show the assignment.
5. Repeat the assignment request and confirm it returns an error.

## Track B — notices and enquiries
1. As admin, create a notice and an enquiry.
2. Confirm both appear in their admin lists.
3. Pin/mark the notice urgent and reload.
4. Move the enquiry NEW -> CONTACTED -> CONVERTED or CLOSED.
5. Confirm an invalid status transition returns 400.

## Track C — feedback and receipts
1. Log in as a resident and open the resolved complaint.
2. Submit one rating and comment for that complaint.
3. Submit it again and confirm the duplicate is rejected.
4. Open receipts as resident and confirm only own receipts appear.
5. Open feedback as admin and confirm averages are returned.

## Track D — auth, summary and seed
1. Run `cd server && npm run seed:demo` twice.
2. Confirm both runs finish with the same room/bed/resident/payment counts.
3. Log in with the existing admin and resident demo accounts.
4. As admin, call `/api/pg/summary` and compare counts with `/api/rooms`.
5. Confirm direct `/register` is unavailable; only admin resident creation works.
