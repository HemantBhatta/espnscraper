const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = "https://www.espncricinfo.com/series/west-indies-in-india-2025-26-1479561/india-vs-west-indies-1st-test-1479569/ball-by-ball-commentary"


function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}



async function getMatchSummary(page_elem) {
    const match_data = await page_elem.evaluate((el) => {
        let match_overall_data = {}
        let match_team_data = []
        const match_summary_wrap = el.querySelector("div")

        const match_summary_wrap_lvl1 = match_summary_wrap.querySelector("div")
        const match_summary_wrap_lvl2 = match_summary_wrap_lvl1.querySelector("div")
        const children = match_summary_wrap_lvl2.querySelectorAll(":scope > div");

        if (children.length >= 2) {
            const data_div = children[1]
            const data_div1 = data_div.querySelector('div')


            const data_div2 = data_div1.querySelector('div')
            const data_div3 = data_div2.querySelector('div')

            const inner_data2 = data_div3.querySelectorAll('.ci-team-score')

            inner_data2.forEach((node, index) => {
                const team_logo = node.querySelector('img').getAttribute('src');
                const team_name_div = node.querySelectorAll(":scope > div")
                if (team_name_div.length >= 1) {
                    const team_name = team_name_div[0].textContent
                    const team_score = team_name_div[1]?.textContent
                    match_team_data.push({ team_logo, team_name, team_score })
                }
            })
            const match_summary_text = data_div3.querySelector('p').textContent
            match_overall_data['match_summary_text'] = match_summary_text
            match_overall_data['match_team_data'] = match_team_data
        } else {
            return "Not enough div children";
        }

        return match_overall_data
    })

    return match_data
}



async function getCommentryData(page_elem) {
    const match_data = await page_elem.evaluate((el) => {
        const match_commentry = el.querySelectorAll(":scope > div")

        const commentry_data = []
        let match_overall_data = {}
        if (match_commentry.length > 0) {
            match_commentry.forEach((comment, index) => {
                const single_comment = comment.querySelector('div')
                const single_comment_divs = single_comment.querySelectorAll('div')
                let over_class_list = ''
                let end_of_over_txt = ''
                let end_of_over_runs = ''
                let over_summary_lvl3_rem_runs = ''
                let over_summary_lvl3_runs = ''
                if (single_comment_divs.length > 1) {
                    over_class_list = single_comment_divs[0].className
                    if (over_class_list == '') {
                        const over_summary = single_comment_divs[0]
                        const over_summary_childs = over_summary.querySelectorAll(":scope > div")
                        if (over_summary_childs.length >= 3) {
                            const over_summary_wrap = over_summary_childs[2]
                            const over_summary_wrap_lvl1 = over_summary_wrap.querySelector('div')
                            const over_summary_wrap_lvl1_divs = over_summary_wrap_lvl1.querySelectorAll(":scope > div")
                            if (over_summary_wrap_lvl1_divs.length >= 2) {
                                const over_summary_lvl2 = over_summary_wrap_lvl1_divs[0]
                                const over_summary_lvl2_divs = over_summary_lvl2.querySelectorAll(":scope > div")
                                if (over_summary_lvl2_divs.length >= 2) {
                                    const over_summary_lvl3 = over_summary_lvl2_divs[0]
                                    const over_summary_lvl3_runs_stat = over_summary_lvl2_divs[1]
                                    const over_summary_lvl3_runs_stat_spans = over_summary_lvl3_runs_stat.querySelectorAll(":scope > span")
                                    over_summary_lvl3_runs = over_summary_lvl3_runs_stat_spans.length > 0 ? over_summary_lvl3_runs_stat_spans[0].textContent : ''
                                    over_summary_lvl3_rem_runs = over_summary_lvl3_runs_stat_spans.length > 1 ? over_summary_lvl3_runs_stat_spans[1].textContent : ''
                                    const over_summary_lvl3_spans = over_summary_lvl3.querySelectorAll(":scope > span")
                                    if (over_summary_lvl3_spans.length >= 2) {
                                        end_of_over_txt = over_summary_lvl3_spans[0].textContent
                                        end_of_over_runs = over_summary_lvl3_spans[1].textContent
                                    }
                                }
                            }
                        }
                    }
                }
                const single_comment_lvl1 = single_comment.querySelector(':scope > .ds-hover-parent')
                const single_comment_lvl2 = single_comment_lvl1.querySelector('div')
                const single_comment_lvl2_divs = single_comment_lvl2.querySelectorAll(':scope > div')
                const single_comment_lvl2_over_div =
                    single_comment_lvl2_divs.length > 0 ? single_comment_lvl2_divs[0] : null;

                const single_comment_lvl2_over_n_div = single_comment_lvl2_over_div.querySelector(":scope > span").textContent
                const single_comment_lvl2_over_score_div = single_comment_lvl2_over_div.querySelector(":scope >div span").textContent

                const single_comment_lvl2_comment_div =
                    single_comment_lvl2_divs.length > 1 ? single_comment_lvl2_divs[1].textContent : null;
                commentry_data.push({ over_summary_lvl3_rem_runs, over_summary_lvl3_runs, end_of_over_txt, end_of_over_runs, over_class_list, single_comment_lvl2_over_n_div, single_comment_lvl2_over_score_div, single_comment_lvl2_comment_div })
            })
        }


        match_overall_data['commentry_data'] = commentry_data
        return match_overall_data
    });

    return match_data
}


async function getDeliveryList(page_elem) {

    const match_commentry = await page_elem.$$(":scope > div")

    if (match_commentry.length >= 2) {
        const match_commentry_lvl1 = match_commentry[1]
        const match_commentry_lvl2 = await match_commentry_lvl1.$("div")
        const match_commentry_lvl2_childs = await match_commentry_lvl2.$$(":scope > div")
        if (match_commentry_lvl2_childs.length >= 2) {
            const match_commentry_lvl3 = match_commentry_lvl2_childs[1]
            const match_commentry_lvl4 = await match_commentry_lvl3.$('div')
            const match_commentry_lvl5 = await match_commentry_lvl4.$('div')
            const match_commentry_lvlp = await match_commentry_lvl5.$$(":scope > div")
            let commentry_list = 0
            let stable_itr = 0
            if (!match_commentry_lvlp.length) return;
            let final_data = []
            while (true) {
                const abcd = await match_commentry_lvl5.evaluate((el) => {
                    const children = el.querySelectorAll(':scope > div');
                    const last = children[children.length - 1];
                    if (!last) return false;



                    // Compute how far we need to move so the element's bottom sits ~40px above the viewport bottom
                    const r = last.getBoundingClientRect();
                    const deltaToBottom = r.bottom - (window.innerHeight - 40);

                    // Scroll the WINDOW (only scroller) by the exact delta, but never negative
                    const base = Math.max(0, Math.round(deltaToBottom));

                    // Add an extra 500px to expose any loader/sentinel below the last item
                    window.scrollBy(0, base + 500);

                    return children.length
                });

                if (abcd === commentry_list) {
                    if (stable_itr > 3) {
                        final_data = await getCommentryData(match_commentry_lvl5)

                        break
                    }
                    stable_itr++
                } else {
                    commentry_list = abcd
                }

                await sleep(10000);

                console.log('✅ Scrolled to the last element and waited 10 seconds');

            }

            return final_data


        }
    }

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

        const level_two_div = await level_one_div.$("div")
        const level_three_div = await level_two_div.$("div")
        const level_four_div = await level_three_div.$("div:nth-of-type(3)")
        const level_five_div = await level_four_div.$("div")

        const match_summary = await getMatchSummary(level_five_div)
        await sleep(5000);

        const match_delivery_arr = await getDeliveryList(level_five_div)

        match_delivery_arr['match_sum'] = match_summary
        console.log(match_delivery_arr, 'match_dev');

        fs.writeFileSync(
            "espncrickdata.json",   // file name per category
            JSON.stringify(match_delivery_arr, null, 2),               // pretty JSON
            'utf-8'
        );
    } catch (err) {
        console.error('Scrape error:', err);
    } finally {
        await browser.close();
    }
}

main()
