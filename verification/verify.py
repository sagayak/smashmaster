
from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/")
            # Wait for the main title to ensure app loads
            page.wait_for_selector("text=SmashMaster Pro")

            # Click on 'Admin Login to Add' to open the modal
            page.click("text=Admin Login to Add")

            # Wait for the modal to appear
            page.wait_for_selector("text=Admin Access")

            # Take a screenshot
            page.screenshot(path="verification/app_verification.png")
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
