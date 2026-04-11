
| Item | Result |
| -------- | -------- |
| Date   | April 10, 2026   |
| Target   | pizza.ethanm.click   |
| Classification | Client-Side Price Manipulation |
| Severity | 1 |
| Description | Price sent in Client-side request. Able to be modified via Burpsuite before payment. Pizzas ordered for free. |
| Images | ![Price Change](./PriceChangeImage.png) |
| Corrections | In order router, added a new function that rather than taking the request body, checks that the request body matches the menu, then sends the menu item. So there is no trust in what the client sends over.  |

| Item | Result |
| -------- | -------- |
| Date   | April 11, 2026   |
| Target   | pizza.ethanm.click   |
| Classification | Client-Side Password Manipulation |
| Severity | 2 |
| Description | When a user updates their password, the request can be intercepted to make the password something different, allowing bad actors to enter customer accounts with their own credentials. |
| Images | ![Price Change](C:/Users/ethan/OneDrive - Brigham Young University/Desktop/School Folder/BYU Winter 2026/329 Misc/HackedUser.png) |
| Corrections | In order router, added a new function that rather than taking the request body, checks that the request body matches the menu, then sends the menu item. So there is no trust in what the client sends over.  |
