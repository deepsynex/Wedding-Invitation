from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    page.goto('file:///' + os.path.abspath('video_player.html').replace('\\', '/'))
    page.wait_for_timeout(1000)

    for ts in [5.0, 7.0, 9.0, 16.0, 24.0]:
        page.evaluate(f'document.getElementById("v").currentTime = {ts};')
        page.wait_for_timeout(300)
        page.screenshot(path=f'rec_frame_{int(ts)}s.png')
    browser.close()
print('Additional recording frames captured!')
