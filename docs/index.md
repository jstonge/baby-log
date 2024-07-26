---
theme: dashboard
toc: false
sql:
    data: ./data/Baby Journey.csv
---



<h1>Hello, Breastfeeding</h1>

```js
const rangeInput = Inputs.range(d3.extent([...raw_data].map((d) => d.DaysSinceBirth)), {label: "Day:", step: 1});
const range = Generators.input(rangeInput);
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Nombre jours d'existence</h2>
    <span class="big">${[...days][0]['Days']}</span>
  </div>
  <div class="card">
    <h2>Total nombre d'allaitements</h2>
    <span class="big">${[...count_pipi][0]['n']}</span>
  </div>
  <div class="card">
    <h2>Total nombre 💩</h2>
    <span class="big">${[...count_pipi][1]['n']}</span>
  </div>
  <div class="card">
    <h2>Total nombre pipi</h2>
    <span class="big">${[...count_pipi][2]['n']}</span>
  </div>
</div>

```js
const bf = [...breastfeed_ts].filter(d=>d.Activities==='Allaitement' && d.DaysSinceBirth === range)
```
```js
const emoji = ({ Selles: "💩", Pipi: "💧", "Lait exprimé": `💉`, "Allaitement.réconfort": "😌" })
```

<div class="grid grid-cols-1">
  <div class="card">
    ${rangeInput}
    ${resize((width) => Plot.plot({ 
    width,
    grid: true,
    nice:true,
    x: { transform: (x) => formatTime(x), label: "Date"  },
    y: { label: "Temps Cumulatif Allaitement (minutes)"  },
    color: {legend: true},
    marks: [
        Plot.lineY(bf, Plot.mapY("cumsum", {
            x: "start", y: "Duration", stroke: "lightgrey", 
            })),
        Plot.dotY(bf, Plot.mapY("cumsum", {
            x: "start", y: "Duration", fill: "black", tip: true, title: d=>`${d.start}(${d.Duration}min)`
            })),
        Plot.textX([...other_activities].filter(d=>d.DaysSinceBirth === range), {
            fontSize: 20,
            text: (d) => `${emoji[d.Activities]} `,
            x: "start",
            y: 5
        }),
        ]})
    )}
    ${resize((width) => Plot.plot({ 
            width,
            x: { transform: (x) => formatTime(x), label: null, fontSize: 0, tickSize: 0  },
            nice:true,
            marginLeft: 40,
            marks: [
                Plot.frame(),
                Plot.barX(bf, { x1: "start", x2: "end" })
            ]})
        )}
    </div>
</div>
<div class="card" style="padding: 0;">
        ${Inputs.table(raw_data)}
</div>


```js
const formatTime = d3.utcParse("%Y-%m-%d %H:%M");
```

```sql id=breastfeed_ts
SELECT 
    Time1 as start, 
    Time2 as end,
    regexp_extract(Duration, '([1-9 ]+)m?', 1)::Integer as Duration,
    Activities,
    DaysSinceBirth
FROM data 
WHERE (Activities = 'Allaitement' OR Activities = 'Lait exprimé')
```

```sql id=other_activities
SELECT Time1 as start, Time2 as end, Activities, DaysSinceBirth
FROM data 
WHERE Activities != 'Allaitement'
```

```sql id=count_pipi 
SELECT COUNT(Activities) as n, Activities FROM data GROUP BY Activities
```

```sql id=days 
SELECT MAX(DaysSinceBirth) as Days FROM data
```

```sql id=raw_data
SELECT * FROM data 
```