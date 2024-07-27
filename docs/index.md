---
theme: dashboard
toc: false
sql:
    data: Baby Journey.csv
---


<h1>Hello, Breastfeeding</h1>


```sql id=days 
SELECT MAX(DaysSinceBirth) as Days FROM data
```

```sql id=count_pipi 
SELECT COUNT(Activities) as n, Activities FROM data GROUP BY Activities
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
const bf = [...breastfeed_ts].filter(d => 
    d.Activities==='Allaitement' && 
    formatTime(d.start) > startEnd[0] && formatTime(d.start) < startEnd[1]
)
```

```js
const emoji = ({ Selles: "💩", Pipi: "💧", "Lait exprimé": `💉`, "Allaitement.réconfort": "😌" })
```

```js
const minmax_Date = d3.extent(bf.map(d=>d.start))
```

```js
const guideline = generateGuideline(bf.at(0)['start'], bf.at(bf.length-1)['end']);
```

<div class="grid grid-cols-1">
  <div class="card">
    <h3>Brush to filter</h3>
    ${resize((width => Plot.plot({
        width,
        x: { transform: (x) => formatTime(x), label: "Date"  },
        marks: [
            Plot.frame(),
            Plot.tickX(raw_data, {x: "Time1"}),
            (index, scales, channels, dimensions, context) => {
            const x1 = dimensions.marginLeft;
            const x2 = dimensions.width - dimensions.marginRight;
            const y1 = 0;
            const y2 = dimensions.height;
            const brushed = (event) => setStartEnd(event.selection?.map(scales.x.invert));
            const brush = d3.brushX().extent([[x1, y1], [x2, y2]]).on("brush end", brushed);
            return d3.create("svg:g").call(brush).node();
            }
    ]
    })))}
    <br>
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
            Plot.lineY(guideline, Plot.mapY("cumsum", {
                x: "start", y: "Duration", stroke: "black",  strokeDasharray: 10, strokeOpacity: 0.2
                })),
            Plot.textX(other_activities.filter(d => formatTime(d.start) > startEnd[0] & formatTime(d.start) < startEnd[1]), {
                fontSize: 20,
                text: (d) => `${emoji[d.Activities]} `,
                x: "start",
                y: 0,
                dy: 15
            })
            ]})
    )}
    ${resize((width) => Plot.plot({ 
            width,
            x: { transform: (x) => formatTime(x) },
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

<!-- Plot.axisX({label: null, fontSize: 0, tickSize: 0}), -->

```js
const maxDate = new Date(raw_data.at(raw_data.length-1)['Time1'])
```
```js
const one_day_before_max = new Date(maxDate.getTime() - 86400*1000)
```

```js
const startEnd = Mutable([one_day_before_max, maxDate]);
const setStartEnd = (se) => startEnd.value = se;
```

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
WHERE Activities = 'Allaitement'
```

```sql id=[...other_activities]
SELECT Time1 as start, Time2 as end, Activities, DaysSinceBirth
FROM data 
WHERE Activities != 'Allaitement'
```


```sql id=[...raw_data]
SELECT * FROM data 
```

```js
function generateGuideline(lowerDateInput, upperDateInput) {
    const guideline = [];
    
    const lowerDate = lowerDateInput;
    const formatDate = d3.timeFormat("%Y-%m-%d %H:%M");
    let currentDate = new Date(lowerDate);

    let isStart = true;

    while (currentDate <= formatTime(upperDateInput)) {
        guideline.push({
            start: isStart ? lowerDateInput : formatDate(currentDate),
            Duration: isStart ? 0 : 30
        });
        

        currentDate.setHours(currentDate.getHours() + 3);
        isStart = false;
    }
    
    guideline.push({ start: formatDate(currentDate), Duration: 30 });
    
    currentDate.setHours(currentDate.getHours()+3);
    guideline.push({ start: formatDate(currentDate), Duration: 30 });

    return guideline;
}
```
