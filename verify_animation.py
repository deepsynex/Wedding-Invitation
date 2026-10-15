from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('http://localhost:8080/')
    page.wait_for_timeout(800)
    page.screenshot(path='anim_step1_gate.png')

    # Click to open invitation
    page.click('#envelopeStage')

    # Step 2: Screen 2 just opened (+1000ms from click). Couple photo visible under flap, card tucked in pocket!
    page.wait_for_timeout(1050)
    page.screenshot(path='anim_step2_photo_visible.png')

    # Step 3: Card rising upward halfway through emergence (+700ms)
    page.wait_for_timeout(700)
    page.screenshot(path='anim_step3_card_rising.png')

    # Step 4: Card fully emerged and resting (+1000ms)
    page.wait_for_timeout(1000)
    page.screenshot(path='anim_step4_card_emerged.png')

    # Step 5: Full page of Screen 2
    page.screenshot(path='anim_screen2_full.png', full_page=True)
    browser.close()
print('Precise animation steps captured!')
