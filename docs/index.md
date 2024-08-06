---
theme: dashboard
toc: false
sql:
    data: Activities.csv
    data2: Weight.csv
---


<h1>Hello, Breastfeeding</h1>


```sql id=days 
SELECT MAX(DaysSinceBirth) as Days FROM data
```

```sql id=count_pipi 
SELECT COUNT(Activities) as n, Activities FROM data GROUP BY Activities
```

```sql id=[...weight]
SELECT Days::STRING as days, Weight FROM data2
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2># Days of Existence</h2>
    <span class="big">${[...days][0]['Days']}</span>
  </div>
  <div class="card">
    <h2>Total # breastfeeds</h2>
    <span class="big">${[...count_pipi][0]['n']}</span>
  </div>
  <div class="card">
    <h2>Total number of 💩</h2>
    <span class="big">${[...count_pipi][1]['n']}</span>
  </div>
  <div class="card">
    <h2>Total # of wet diapers</h2>
    <span class="big">${[...count_pipi][2]['n']}</span>
  </div>
</div>

```js
const bf = breastfeed_ts.filter(d => 
    formatTime(d.start) > startEnd[0] && formatTime(d.start) < startEnd[1]
)
```

```js
const nights = generateNightIntervals(raw_data.at(0)['Time1'], raw_data.at(raw_data.length-1)['Time2']);
const nights_bf = generateNightIntervals(bf.at(0)['start'], bf.at(bf.length-1)['end']);
```

```js
const emoji = ({ Selles: "💩", Pipi: "💧", "Lait exprimé": `💉`, "Allaitement.réconfort": "😌" })
```

```js
const guideline = generateGuideline(bf.at(0)['start'], bf.at(bf.length-1)['end']);
```

<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">
    <h3>Brush to filter</h3>
    ${resize((width => Plot.plot({
        width,
        height: 70,
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
        marginBottom: 45,
        x: { transform: (x) => formatTime(x), label: null  },
        y: { label: "Cumulative sum breastfeeding (mins)"  },
        color: {
            legend: true, type: "ordinal", 
            domain: ["Novice", "Average", "Pro", "Pro Extra"], 
            range: ["#966532", "silver", "olive", "#E5B80B"], 
            label: "Breastfeeding time"
        },
        marks: [
            Plot.link(get_coords(), {
                x1: "x1", x2: "x2", y1: "y1", y2:"y2", markerEnd: "arrow",
                stroke: (d) => d.QualityBF, 
                strokeWidth: 1.8, 
                tip: true, title: d=>`${d.x1}(${d.y2-d.y1}mins)`
                }),
            Plot.lineY(guideline, Plot.mapY("cumsum", {
                x: "start", y: "Duration", stroke: "black",  strokeDasharray: 10, strokeOpacity: 0.2
                })),
            Plot.textX(other_activities.filter(d => formatTime(d.start) > startEnd[0] & formatTime(d.start) < startEnd[1]), {
                fontSize: 18,
                text: (d) => `${emoji[d.Activities]} `,
                x: "start",
                y: 0,
                dy: 35
            }),
            Plot.rectY(nights_bf, { 
                x1: "start", x2: "end", y: d3.sum(guideline.map(d=>d.Duration)), fill: "midnightblue", opacity: 0.1 
            })
            ]})
    )}
    <br>
    <small>p.s. Midnight blue zones represent nights, starting at 19:00 and ending at 7:00. Ticked lines are breastfeeding guidelines, which is about 30mins/3hours.</small>
    </div>
    <div class="card">
    <p>Aggregated patterns of activities</p>
    ${resize((width) => Plot.plot({
        x: {type: "utc"},
        width,
        height:100,
        marks: [
            Plot.frame(),
            Plot.tickX(breastfeed_ts, {x: d => extractTime(formatTime(d.start)), strokeOpacity: 0.1})
        ]
        })
    )} 
    <p>Weight over time</p>
    ${resize((width) => Plot.plot({
        width,
        height: 200,
        grid: true,
        y: {label: "Weight (grams)"},
        x: { transform: (x) => formatDay(x), label: null  },
        marks: [
            Plot.line(weight, {x: "days", y: "Weight"}),
            Plot.dot(weight, {x: "days", y: "Weight", fill: "black", stroke: "white"})
        ]
        })
    )} 
    <p>Average breastfeed duration</p>
    ${resize((width) => Plot.plot({
        width,
        height: 200,
        y: {grid: true},
        marks: [
            Plot.rectY(raw_data, Plot.binX({y:"count"}, {x: "Duration"}))
        ]
        })
    )} 
</div>
</div>
<div class="card" style="padding: 0;">
    ${Inputs.table(bf)}
</div>


```js
const maxDate = new Date(raw_data.at(raw_data.length-1)['Time1'])
```

```js
const one_day_before_max = new Date(maxDate.getTime() - 86400*1000)
const startEnd = Mutable([one_day_before_max, maxDate]);
const setStartEnd = (se) => startEnd.value = se;
```

```js
const formatTime = d3.utcParse("%Y-%m-%d %H:%M");
const formatDay = d3.utcParse("%Y-%m-%d");
```

```sql id=[...breastfeed_ts]
SELECT 
    Time1 as start, 
    Time2 as end,
    regexp_extract(Duration, '([1-9 ]+)m?', 1)::Integer as Duration,
    Activities,
    qualityBF,
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
SELECT regexp_extract(Duration, '([1-9 ]+)m?', 1)::Integer as Duration, * FROM data 
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

function extractTime(date) {
    // Create a new Date object set to the epoch (January 1, 1970)
    const newDate = new Date(0);
    
    // Extract hours, minutes, and seconds from the input date
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // Set the time on the new Date object
    newDate.setUTCHours(hours, minutes, 0);

    return newDate;
}

function generateNightIntervals(lowerDateInput, upperDateInput) {
    const intervals = [];
    
    // Ensure the lower and upper dates are Date objects
    const lowerDate = new Date(lowerDateInput);
    const upperDate = new Date(upperDateInput);

    const formatDate = date => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    let currentDate = new Date(lowerDate);
    currentDate.setUTCHours(19, 0, 0, 0); // Start the first night at 19:00 of the lowerDate

    while (currentDate < upperDate) {
        // Create start and end times for the current night
        const start = new Date(currentDate);

        const end = new Date(currentDate);
        end.setUTCDate(end.getUTCDate() + 1); // Move to the next day
        end.setUTCHours(7, 0, 0, 0); // 07:00 of the next day

        // Only include intervals that fall within the specified range
        if (start >= lowerDate && end <= upperDate) {
            intervals.push({ start: formatDate(start), end: formatDate(end) });
        } else if (end > upperDate) {
            intervals.push({ start: formatDate(start), end: formatDate(upperDate) });
            break;
        }
        
        // Move to the next day at 19:00
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        currentDate.setUTCHours(19, 0, 0, 0);
    }

    return intervals;
}

function get_coords() {
    let cumulativeDuration = 0;
    return bf.map(d => {
        const previousDuration = cumulativeDuration;
        cumulativeDuration += d.Duration;
        return {
            x1: d.start,
            y1: previousDuration,
            x2: d.end,
            y2: cumulativeDuration,
            QualityBF: d.QualityBF
        };
    });
}
```
