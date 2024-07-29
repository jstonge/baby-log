import {csv} from "d3-fetch";


async function read_dat() {
    return await csv("https://raw.githubusercontent.com/jstonge/baby-log/main/docs/Baby%20Journey.csv");
}

async function printData() {
    const data = await read_dat();
    process.stdout.write(JSON.stringify(data, null, 2));
}

printData();