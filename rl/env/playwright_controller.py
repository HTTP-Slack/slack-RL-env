"""
Browser automation controller using Playwright.

Handles browser lifecycle, navigation, and action execution.
"""

from typing import Dict, Any, Optional
from playwright.async_api import async_playwright, Browser, Page, Playwright
import structlog

logger = structlog.get_logger()


class PlaywrightController:
    """
    Controller for browser automation via Playwright.

    Manages browser instance, page navigation, and action execution.
    """

    def __init__(
        self,
        headless: bool = True,
        browser_type: str = "chromium",
        viewport: Dict[str, int] = None,
        base_url: str = "http://localhost:5173",
        record_video: bool = False,
        video_dir: str = "./videos"
    ):
        """
        Initialize Playwright controller.

        Args:
            headless: Whether to run browser in headless mode
            browser_type: Browser to use ('chromium', 'firefox', 'webkit')
            viewport: Viewport size dict with 'width' and 'height'
            base_url: Base URL for the application
            record_video: Whether to record video of sessions
            video_dir: Directory to save videos
        """
        self.headless = headless
        self.browser_type = browser_type
        self.viewport = viewport or {"width": 1920, "height": 1080}
        self.base_url = base_url
        self.record_video = record_video
        self.video_dir = video_dir

        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def launch(self):
        """Launch browser and create new page."""
        logger.info("Launching browser", browser_type=self.browser_type, headless=self.headless)

        self.playwright = await async_playwright().start()

        # Select browser type
        if self.browser_type == "chromium":
            browser_launcher = self.playwright.chromium
        elif self.browser_type == "firefox":
            browser_launcher = self.playwright.firefox
        elif self.browser_type == "webkit":
            browser_launcher = self.playwright.webkit
        else:
            raise ValueError(f"Unknown browser type: {self.browser_type}")

        # Launch browser with options
        launch_options = {"headless": self.headless}
        if self.record_video:
            launch_options["record_video_dir"] = self.video_dir

        self.browser = await browser_launcher.launch(**launch_options)

        # Create new page with viewport
        self.page = await self.browser.new_page(viewport=self.viewport)

        logger.info("Browser launched successfully")

    async def close(self):
        """Close browser and clean up resources."""
        if self.page:
            await self.page.close()
            self.page = None

        if self.browser:
            await self.browser.close()
            self.browser = None

        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

        logger.info("Browser closed")

    async def navigate_to(self, path: str, wait_for: str = "networkidle"):
        """
        Navigate to a URL path.

        Args:
            path: URL path (e.g., '/dashboard', '/later')
            wait_for: Wait condition ('load', 'networkidle', 'domcontentloaded')

        Returns:
            Dict with success status
        """
        if not self.page:
            raise RuntimeError("Browser not launched. Call launch() first.")

        url = f"{self.base_url}{path}" if not path.startswith("http") else path

        try:
            logger.debug("Navigating to URL", url=url)
            await self.page.goto(url, wait_until=wait_for, timeout=30000)
            logger.info("Navigation successful", url=url)
            return {"success": True, "url": url}
        except Exception as e:
            logger.error("Navigation failed", url=url, error=str(e))
            return {"success": False, "error": str(e)}

    async def authenticate(
        self,
        username: str = "test@example.com",
        password: str = "password123"
    ):
        """
        Authenticate user via sign-in flow.

        Args:
            username: Username/email
            password: Password

        Returns:
            Dict with success status
        """
        try:
            logger.info("Starting authentication", username=username)

            # Navigate to sign-in page
            await self.navigate_to("/signin")

            # Fill in credentials
            await self.page.fill('input[type="email"], input[name="email"]', username)
            await self.page.fill('input[type="password"], input[name="password"]', password)

            # Submit form
            await self.page.click('button[type="submit"], button:has-text("Sign In")')

            # Wait for navigation
            await self.page.wait_for_load_state("networkidle", timeout=10000)

            logger.info("Authentication successful", username=username)
            return {"success": True}

        except Exception as e:
            logger.error("Authentication failed", username=username, error=str(e))
            return {"success": False, "error": str(e)}

    async def execute_action(self, action_call: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an action on the page.

        Args:
            action_call: Action dictionary with 'name' and 'parameters'

        Returns:
            Dict with success status and any relevant data
        """
        if not self.page:
            raise RuntimeError("Browser not launched")

        action_name = action_call["name"]
        parameters = action_call.get("parameters", {})

        try:
            logger.debug("Executing action", action=action_name, params=parameters)

            if action_name == "navigate_to_url":
                return await self._action_navigate(parameters)

            elif action_name == "click_element":
                return await self._action_click(parameters)

            elif action_name == "type_text":
                return await self._action_type(parameters)

            elif action_name == "send_message":
                return await self._action_send_message()

            elif action_name == "open_search":
                return await self._action_open_search()

            elif action_name == "scroll":
                return await self._action_scroll(parameters)

            elif action_name == "wait":
                return await self._action_wait(parameters)

            elif action_name == "task_complete":
                return {"success": True, "message": "Task marked as complete"}

            else:
                logger.warning("Unknown action", action=action_name)
                return {"success": False, "error": f"Unknown action: {action_name}"}

        except Exception as e:
            logger.error("Action execution failed", action=action_name, error=str(e))
            return {"success": False, "error": str(e)}

    async def _action_navigate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Navigate to URL."""
        url = params["url"]
        result = await self.navigate_to(url)
        return result

    async def _action_click(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Click on element by ID."""
        element_id = params["element_id"]

        # Try multiple strategies to find and click the element
        try:
            # Strategy 1: Try data attribute
            selector = f'[data-element-id="{element_id}"]'
            if await self.page.query_selector(selector):
                await self.page.click(selector, timeout=5000)
                return {"success": True, "element_id": element_id}

            # Strategy 2: Try XPath from stored mapping (if available)
            # This would require storing XPath mappings from observation
            # For now, we'll try a fallback

            # Strategy 3: Try to infer element from accessibility tree
            # (This is a simplified version - in production, you'd store mappings)
            logger.warning("Element not found by ID, trying fallback", element_id=element_id)
            return {"success": False, "error": f"Element {element_id} not found"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _action_type(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Type text into focused element."""
        text = params["text"]
        await self.page.keyboard.type(text, delay=50)  # 50ms delay between keystrokes
        return {"success": True, "text": text}

    async def _action_send_message(self) -> Dict[str, Any]:
        """Send message by pressing Enter."""
        await self.page.keyboard.press("Enter")
        await self.page.wait_for_timeout(500)  # Wait for message to send
        return {"success": True}

    async def _action_open_search(self) -> Dict[str, Any]:
        """Open search modal with Cmd/Ctrl+K."""
        # Detect platform for correct modifier key
        platform = await self.page.evaluate("() => navigator.platform")
        modifier = "Meta" if "Mac" in platform else "Control"

        await self.page.keyboard.press(f"{modifier}+KeyK")
        await self.page.wait_for_timeout(500)  # Wait for modal to appear
        return {"success": True}

    async def _action_scroll(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scroll page."""
        direction = params["direction"]
        amount = params.get("amount", 300)

        delta_y = amount if direction == "down" else -amount
        await self.page.mouse.wheel(0, delta_y)
        await self.page.wait_for_timeout(300)  # Wait for scroll animation
        return {"success": True, "direction": direction, "amount": amount}

    async def _action_wait(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Wait for specified duration."""
        seconds = params.get("seconds", 1.0)
        milliseconds = int(seconds * 1000)
        await self.page.wait_for_timeout(milliseconds)
        return {"success": True, "seconds": seconds}

    async def get_page(self) -> Page:
        """Get current page object."""
        if not self.page:
            raise RuntimeError("Browser not launched")
        return self.page

    async def take_screenshot(self, path: Optional[str] = None) -> bytes:
        """
        Take screenshot of current page.

        Args:
            path: Optional path to save screenshot

        Returns:
            Screenshot bytes
        """
        if not self.page:
            raise RuntimeError("Browser not launched")

        screenshot_bytes = await self.page.screenshot(type="png", path=path)
        return screenshot_bytes
