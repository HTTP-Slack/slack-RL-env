"""
Multi-modal observation extraction from browser pages.

This module extracts observations from the Playwright page object, including:
- Screenshots (for vision models like GLM-4.6)
- Accessibility tree (structured interactive elements)
- Page state metadata (URL, active view, etc.)
"""

import base64
from typing import Dict, List, Any, Optional
from io import BytesIO
import numpy as np
from PIL import Image


async def extract_observation(page, step_count: int = 0) -> Dict[str, Any]:
    """
    Extract multi-modal observation from the current page state.

    Args:
        page: Playwright page object
        step_count: Current step number in the episode

    Returns:
        Dictionary containing screenshot, accessibility tree, and metadata
    """
    # Take screenshot
    screenshot_bytes = await page.screenshot(type="png")
    screenshot_pil = Image.open(BytesIO(screenshot_bytes))

    # Convert to numpy array for gym compatibility
    screenshot_array = np.array(screenshot_pil)

    # Base64 encode for API transmission
    screenshot_b64 = base64.b64encode(screenshot_bytes).decode("utf-8")

    # Extract accessibility tree
    accessibility_tree = await extract_accessibility_tree(page)

    # Get page metadata
    url = page.url
    state_metadata = await extract_state_metadata(page, url)

    observation = {
        "screenshot": {
            "array": screenshot_array,  # numpy array for gym
            "encoding": screenshot_b64,  # base64 for API
            "resolution": screenshot_array.shape[:2],  # (height, width)
        },
        "accessibility_tree": accessibility_tree,
        "state": {
            "url": url,
            "active_view": state_metadata["active_view"],
            "step_count": step_count,
            "timestamp": state_metadata["timestamp"],
            "visible_components": state_metadata["visible_components"],
        }
    }

    return observation


async def extract_accessibility_tree(page) -> Dict[str, Any]:
    """
    Extract simplified accessibility tree with interactive elements.

    Uses JavaScript to query interactive elements and their properties.

    Args:
        page: Playwright page object

    Returns:
        Dictionary with interactive elements and text content
    """
    # JavaScript to extract interactive elements
    js_code = """
    () => {
        const elements = [];
        let elemId = 0;

        // Query interactive elements
        const selectors = [
            'button', 'a', 'input', 'textarea', 'select',
            '[role="button"]', '[role="link"]', '[role="textbox"]',
            '[onclick]', '[tabindex]'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(elem => {
                // Skip if not visible
                const rect = elem.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0 &&
                                window.getComputedStyle(elem).visibility !== 'hidden' &&
                                window.getComputedStyle(elem).display !== 'none';

                if (!isVisible) return;

                // Get element text (inner text or aria-label)
                const text = elem.innerText || elem.ariaLabel || elem.title || elem.alt || '';

                // Get element type
                const tagName = elem.tagName.toLowerCase();
                const role = elem.getAttribute('role') || tagName;

                // Generate XPath
                const getXPath = (element) => {
                    if (element.id) return `//*[@id="${element.id}"]`;
                    if (element === document.body) return '/html/body';

                    let ix = 0;
                    const siblings = element.parentNode?.childNodes || [];
                    for (let i = 0; i < siblings.length; i++) {
                        const sibling = siblings[i];
                        if (sibling === element) {
                            const parentPath = element.parentNode ? getXPath(element.parentNode) : '';
                            return `${parentPath}/${element.tagName.toLowerCase()}[${ix + 1}]`;
                        }
                        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
                    }
                    return '';
                };

                elements.push({
                    id: `elem_${elemId++}`,
                    type: tagName,
                    role: role,
                    text: text.slice(0, 100),  // Limit text length
                    clickable: true,
                    xpath: getXPath(elem),
                    position: {
                        x: Math.round(rect.left),
                        y: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    }
                });
            });
        });

        return {
            elements: elements.slice(0, 50),  // Limit to top 50 elements
            total_count: elements.length,
            page_title: document.title,
            body_text: document.body.innerText.slice(0, 1000)  // First 1000 chars
        };
    }
    """

    try:
        result = await page.evaluate(js_code)
        return {
            "interactive_elements": result["elements"],
            "total_element_count": result["total_count"],
            "page_title": result["page_title"],
            "text_content": result["body_text"]
        }
    except Exception as e:
        # Fallback if JavaScript fails
        return {
            "interactive_elements": [],
            "total_element_count": 0,
            "page_title": await page.title(),
            "text_content": "",
            "error": str(e)
        }


async def extract_state_metadata(page, url: str) -> Dict[str, Any]:
    """
    Extract high-level state metadata from the page.

    Args:
        page: Playwright page object
        url: Current page URL

    Returns:
        Dictionary with state information
    """
    import time

    # Determine active view from URL
    active_view = "unknown"
    if "/dashboard" in url:
        active_view = "dashboard"
    elif "/later" in url:
        active_view = "later"
    elif "/search" in url:
        active_view = "search"
    elif "/signin" in url:
        active_view = "signin"
    elif "/home" in url:
        active_view = "home"

    # Try to detect visible components via JavaScript
    js_detect_components = """
    () => {
        const components = [];

        // Check for various panels/modals
        if (document.querySelector('[class*="activity"]') ||
            document.querySelector('[data-testid*="activity"]')) {
            components.push('activity-panel');
        }

        if (document.querySelector('[class*="dm-panel"]') ||
            document.querySelector('[class*="DMPanel"]')) {
            components.push('dm-panel');
        }

        if (document.querySelector('[class*="search-modal"]') ||
            document.querySelector('[aria-label*="Search"]')) {
            components.push('search-modal');
        }

        if (document.querySelector('[class*="sidebar"]')) {
            components.push('sidebar');
        }

        if (document.querySelector('[class*="chat-pane"]') ||
            document.querySelector('[class*="ChatPane"]')) {
            components.push('chat-pane');
        }

        return components;
    }
    """

    try:
        visible_components = await page.evaluate(js_detect_components)
    except:
        visible_components = []

    return {
        "active_view": active_view,
        "timestamp": time.time(),
        "visible_components": visible_components
    }


def format_observation_for_prompt(observation: Dict[str, Any]) -> str:
    """
    Format observation as human-readable text for LLM prompts.

    Args:
        observation: Observation dictionary

    Returns:
        Formatted string representation
    """
    state = observation["state"]
    tree = observation["accessibility_tree"]

    # Format interactive elements
    elements_text = []
    for elem in tree["interactive_elements"][:20]:  # Top 20 elements
        elem_text = f"  - {elem['id']}: [{elem['type']}] {elem['text'][:50]}"
        if elem.get('role') and elem['role'] != elem['type']:
            elem_text += f" (role: {elem['role']})"
        elements_text.append(elem_text)

    formatted = f"""Current Page State:
URL: {state['url']}
Active View: {state['active_view']}
Step: {state['step_count']}

Page Title: {tree.get('page_title', 'N/A')}

Visible Components: {', '.join(state.get('visible_components', [])) or 'None detected'}

Interactive Elements ({len(tree['interactive_elements'])} total, showing top 20):
{chr(10).join(elements_text) if elements_text else '  (none found)'}

Page Text Preview:
{tree.get('text_content', '')[:300]}...
"""
    return formatted
