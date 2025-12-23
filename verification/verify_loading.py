from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (using the server we started on port 8080)
        page.goto("http://localhost:8080")

        # 1. Verify Loading Screen appears initially
        loading_screen = page.locator("#loading-screen")
        expect(loading_screen).to_be_visible()

        # Take a screenshot of the loading screen
        page.screenshot(path="verification/loading_screen_visible.png")
        print("Captured loading screen")

        # 2. Verify it eventually hides (class 'hidden' is added)
        # We increase timeout because 3D models might take a moment to load
        expect(loading_screen).to_have_class("loading-screen hidden", timeout=10000)

        # Take a screenshot of the game after loading
        page.screenshot(path="verification/game_loaded.png")
        print("Captured loaded game state")

        browser.close()

if __name__ == "__main__":
    run()
