from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    page.goto('file:///' + os.path.abspath('video_player.html').replace('\\', '/'))
    page.wait_for_timeout(1000)

    for ts in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
        page.evaluate(f'document.getElementById("v").currentTime = {ts};')
        page.wait_for_timeout(300)
        page.screenshot(path=f'trans_frame_{ts}s.png')
    browser.close()
print('Transition frames captured!')
