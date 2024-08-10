# Baby Log

Small dashboard to track breastfeeding of my newborn child. We use [Number](https://apps.apple.com/us/app/numbers/id361304891) for data entry. This is great. Then we export here and use [Observable Framework](https://observablehq.com/framework/) to visualize the data.

### Notes

 - Important that all entries are complete. If not, the data loader fails and doesn't read the columns properly.
 - Vectors were clunky. We are back representing breastfeeding with links, with a start and end. We also get rid of `Pro Extra` breastfeeding type.