from playwright.sync_api import sync_playwright
import os

video_path = r'C:\Users\admin\Videos\Screen Recordings\Screen Recording 2026-10-14 142851.mp4'.replace('\\', '/')

html_content = '''<!DOCTYPE html>
<html>
<body style="margin:0; background:black; overflow:hidden;">
<video id="v" src="file:///''' + video_path + '''" style="width:100vw; height:100vh; object-fit:contain;" muted></video>
</body>
</html>'''

with open('video_player2.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    page.goto('file:///' + os.path.abspath('video_player2.html').replace('\\', '/'))
    page.wait_for_timeout(1000)

    for ts in [0.0, 1.0, 2.0, 6.0, 10.0, 13.5, 18.0]:
        page.evaluate(f'document.getElementById("v").currentTime = {ts};')
        page.wait_for_timeout(350)
        page.screenshot(path=f'new_rec_frame_{ts}s.png')
        print(f'Captured {ts}s')
    browser.close()
