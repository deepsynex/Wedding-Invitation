from playwright.sync_api import sync_playwright
import os

video_path = r'C:\Users\admin\Videos\Screen Recordings\Screen Recording 2026-10-13 163612.mp4'.replace('\\', '/')

html_content = '''<!DOCTYPE html>
<html>
<body style="margin:0; background:black; overflow:hidden;">
<video id="v" src="file:///''' + video_path + '''" style="width:100vw; height:100vh; object-fit:contain;" muted></video>
</body>
</html>'''

with open('video_player.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    page.goto('file:///' + os.path.abspath('video_player.html').replace('\\', '/'))
    page.wait_for_timeout(1000)

    timestamps = [0.0, 0.4, 0.7, 1.0, 1.3, 1.7, 2.0, 2.5, 3.0]
    for ts in timestamps:
        page.evaluate(f'document.getElementById("v").currentTime = {ts};')
        page.wait_for_timeout(400)
        page.screenshot(path=f'rec_frame_{ts:.1f}s.png')
        print(f'Frame {ts}s captured')
    browser.close()
