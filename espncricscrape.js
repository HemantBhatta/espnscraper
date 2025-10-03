const puppeteer = require('puppeteer');

const BASE_URL = "https://www.espncricinfo.com/series/afghanistan-v-bangladesh-2025-26-1500384/afghanistan-vs-bangladesh-2nd-t20i-1500391/ball-by-ball-commentary"


function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}


async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    try {
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 })
        await sleep(1000);
        await page.waitForSelector("#main-container", { timeout: 60000 })
        const pEl = await page.$("#main-container")
        const level_one_div = await pEl.$('#main-container > div:nth-of-type(5)')
        const inner = await level_one_div.evaluate((el) => {
            const level_two_div = el.querySelector("div")
            const level_three_div = level_two_div.querySelector("div")
            const level_four_div = level_three_div.querySelector("div:nth-of-type(3)")
            const level_five_div = level_four_div.querySelector("div")
            const title_cmntry = level_five_div.querySelector('h1')
            const match_summary_wrap = level_five_div.querySelector("div")
            const match_summary_wrap_lvl1 = match_summary_wrap.querySelector("div")
            const match_summary_wrap_lvl2 = match_summary_wrap_lvl1.querySelector("div")
            const children = match_summary_wrap_lvl2.querySelectorAll(":scope > div");
            let match_overall_data = {}
            let match_team_data = []
            if (children.length >= 2) {
                const data_div = children[1]
                const data_div1 = data_div.querySelector('div')
                const data_div2 = data_div1.querySelector('div')
                const data_div3 = data_div2.querySelector('div')
                const data_div4 = data_div3.querySelectorAll(':scope > div')
                const inner_data = data_div4[1]
                const inner_data1 = inner_data.querySelector('div')
                const inner_data2 = inner_data1.querySelectorAll('.ci-team-score')
                inner_data2.forEach((node, index) => {
                    const team_logo = node.querySelector('img').getAttribute('src');
                    const team_name_div = node.querySelectorAll(":scope > div")
                    if (team_name_div.length >= 2) {
                        const team_name = team_name_div[0].textContent
                        const team_score = team_name_div[1].textContent
                        match_team_data.push({ team_logo, team_name, team_score })
                    }
                })
                const match_summary_text = data_div3.querySelector('p').textContent
                match_overall_data['match_summary_text'] = match_summary_text
                match_overall_data['match_team_data'] = match_team_data
                return match_overall_data
            } else {
                return "Not enough div children";
            }
        });
        console.log(inner);
    } catch (err) {
        console.error('Scrape error:', err);
    } finally {
        await browser.close();
    }
}

main()
