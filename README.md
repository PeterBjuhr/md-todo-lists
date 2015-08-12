# md-todo-lists
To-do list manager with markdown-like editor

A task is written like this:

````markdown
- [ ] task **date**
````

For the date the following shortcuts can be used:

* Note number of days from the present date, e.g. `3` ("I'll do this task in three days").
* Note number of weeks from the present date, e.g `3w` or `3weeks`
* Note number of months from the present date, e.g `3m` or `3months`
* Note date by keyword, the following keywords are supported: `today`, `td`, `now`, `n`, `tomorrow`, `tom`, `tm`, `next day`, `next week`, `next month`

In most cases these shortcuts are recommended but there are of course also times when you want to write an explicit date. These are the present formats for doing that:

1. `yymmdd`, e.g. '091224'
2. `month day year`, e.g. 'dec 24 09'
3. `mm,dd,yy`, e.g. '12,24,09'
4. `yyyy-mm-dd`, e.g. '2009-12-24'

(*In fact every format that can be recognized by the JavaScript method `Date.parse(dateString)` can be used*)
