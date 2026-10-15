from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('http://localhost:8080/#invitation')
    page.wait_for_timeout(800)

    # Click Kindly RSVP
    page.click('.rsvp-banner-section')
    page.wait_for_timeout(600)
    page.screenshot(path='anim_screen4_rsvp_prompt.png', full_page=True)

    # Click PLEASE RSVP HERE
    page.click('[data-nav-target=\"rsvp-form\"]')
    page.wait_for_timeout(600)
    page.screenshot(path='anim_screen5_rsvp_form.png', full_page=True)
    browser.close()
print('RSVP screens captured!')
