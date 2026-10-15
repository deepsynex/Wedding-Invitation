import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 375, 'height': 667})
        
        # 1. Screen 2: Invitation screen with countdown
        await page.goto('http://127.0.0.1:5500/#invitation', wait_until='networkidle')
        await asyncio.sleep(0.5)
        await page.evaluate("""() => {
            if (window.showScreen) {
                window.showScreen('invitation');
            }
        }""")
        await asyncio.sleep(0.5)
        countdown = await page.query_selector('.countdown-section')
        if countdown:
            await countdown.screenshot(path='verify_countdown_375.png')
            print('Captured verify_countdown_375.png')
            
        story = await page.query_selector('.story-section')
        if story:
            await story.screenshot(path='verify_story_375.png')
            print('Captured verify_story_375.png')
            
        footer = await page.query_selector('.monogram-footer')
        if footer:
            await footer.screenshot(path='verify_footer_375.png')
            print('Captured verify_footer_375.png')

        # 2. Screen 3: Details screen
        await page.evaluate("""() => {
            if (window.showScreen) {
                window.showScreen('details');
            }
        }""")
        await asyncio.sleep(0.5)
        details_header = await page.query_selector('.details-header')
        if details_header:
            await details_header.screenshot(path='verify_details_header_375.png')
            print('Captured verify_details_header_375.png')

        # 3. Screen 4: RSVP screen
        await page.evaluate("""() => {
            if (window.showScreen) {
                window.showScreen('rsvp-prompt');
            }
        }""")
        await asyncio.sleep(0.5)
        rsvp_prompt = await page.query_selector('.rsvp-prompt-card')
        if rsvp_prompt:
            await rsvp_prompt.screenshot(path='verify_rsvp_prompt_375.png')
            print('Captured verify_rsvp_prompt_375.png')

        await page.close()
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
