"""Browser integration checks. Use a temporary profile, never personal bookmarks."""
import argparse
import json
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "verification"
ARTIFACTS.mkdir(parents=True, exist_ok=True)

def screenshot(page, name):
    page.screenshot(path=str(ARTIFACTS / f"{name}.png"))

def settings(page):
    page.get_by_role("button", name="设置", exact=True).click()
    return page.get_by_role("dialog", name="设置", exact=True)

def close(page):
    page.keyboard.press("Escape")

def no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "Horizontal overflow"

def test_preview(browser, url):
    context = browser.new_context(viewport={"width": 1586, "height": 992})
    page = context.new_page()
    errors, external = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: external.append(request.url) if request.url.startswith("http") and not request.url.startswith(url.rstrip("/")) else None)
    page.goto(url)
    page.wait_for_load_state("networkidle")
    expect(page.locator(".folder-panel")).to_have_count(4)
    expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(8)
    assert not page.locator("img").evaluate_all("imgs => imgs.some(i => !i.complete || !i.naturalWidth)")
    no_overflow(page)
    screenshot(page, "desktop")

    page.keyboard.press("/")
    search = page.get_by_role("combobox", name="搜索书签")
    expect(search).to_be_focused()
    search.fill("设计")
    expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(8)
    page.keyboard.press("ArrowDown")
    expect(page.get_by_role("listbox").get_by_role("option").nth(1)).to_have_attribute("aria-selected", "true")
    screenshot(page, "search")
    search.fill("月球旅行")
    expect(page.get_by_text("未找到书签", exact=True)).to_be_visible()
    screenshot(page, "search-empty")
    page.get_by_role("button", name="清空搜索").click()
    expect(search).to_have_value("")
    expect(search).to_be_focused()
    close(page)

    design = page.locator(".folder-panel").filter(has_text="设计与灵感")
    design.get_by_role("button", name="Dribbble的操作", exact=True).click()
    screenshot(page, "bookmark-menu")
    page.keyboard.press("End")
    expect(page.get_by_role("menuitem", name="固定到常用")).to_be_focused()
    page.keyboard.press("Enter")
    expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(9)
    page.reload()
    expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(9)
    page.locator(".pinned-panel").get_by_role("button", name="Dribbble的操作", exact=True).click()
    page.get_by_role("menuitem", name="取消固定").click()
    expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(8)

    page.get_by_role("button", name="展开设计与灵感", exact=True).click()
    folder = page.get_by_role("dialog", name="书签栏 / 设计与灵感", exact=True)
    expect(folder.locator(".bookmark-tile")).to_have_count(8)
    screenshot(page, "folder")
    folder.get_by_role("button", name="Dribbble的操作", exact=True).click()
    close(page)
    expect(folder).to_be_visible()
    close(page)
    expect(page.get_by_role("button", name="展开设计与灵感", exact=True)).to_be_focused()

    panel = settings(page)
    screenshot(page, "settings")
    panel.get_by_role("button", name="深色", exact=True).click()
    for name in ["紧凑图标", "显示时间", "显示欢迎语", "显示文件夹路径", "显示常用网站", "在新标签页打开网站"]:
        panel.get_by_role("switch", name=name, exact=True).click()
    panel.get_by_role("slider", name="面板不透明度").focus()
    page.keyboard.press("Home")
    page.keyboard.press("ArrowRight")
    panel.get_by_role("slider", name="玻璃模糊").focus()
    page.keyboard.press("Home")
    expect(panel.locator(".settings-footer [role=status]")).to_have_text("偏好已保存到此设备")
    close(page)
    page.reload()
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    expect(page.locator(".clock")).to_have_count(0)
    expect(page.locator(".welcome")).to_have_count(0)
    expect(page.locator(".pinned-panel")).to_have_count(0)
    expect(page.locator(".folder-path")).to_have_count(0)
    assert page.locator(".bookmark-link").first.get_attribute("target") is None
    screenshot(page, "dark-compact")
    panel = settings(page)
    assert panel.get_by_role("slider", name="面板不透明度").input_value() == "21"
    assert panel.get_by_role("slider", name="玻璃模糊").input_value() == "0"
    page.locator('input[type="file"]').set_input_files({"name": "invalid.svg", "mimeType": "image/svg+xml", "buffer": b"<svg/>"})
    expect(panel.get_by_role("alert")).to_contain_text("3 MB")
    page.locator('input[type="file"]').set_input_files({"name": "broken.png", "mimeType": "image/png", "buffer": b"not an image"})
    expect(panel.get_by_role("alert")).to_contain_text("无法读取")
    page.locator('input[type="file"]').set_input_files(str(ROOT / "public/icons/128.png"))
    expect(panel.get_by_role("button", name="恢复云海壁纸")).to_be_visible()
    expect(panel.locator(".settings-footer [role=status]")).to_have_text("偏好已保存到此设备")
    close(page)
    page.reload()
    panel = settings(page)
    expect(panel.locator(".theme-card img")).to_have_attribute("src", __import__('re').compile(r"data:image/png;base64,.+"))
    panel.get_by_role("button", name="恢复默认", exact=True).click()
    expect(panel.get_by_role("switch", name="显示时间")).to_have_attribute("aria-checked", "true")
    close(page)
    expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(8)
    expect(page.locator("html")).to_have_attribute("data-theme", "light")

    for width in [1586, 1024, 800, 390, 320]:
        page.set_viewport_size({"width": width, "height": 844})
        no_overflow(page)
        if width == 390:
            screenshot(page, "mobile")
            panel = settings(page)
            screenshot(page, "settings-mobile")
            panel.get_by_role("switch", name="在新标签页打开网站").scroll_into_view_if_needed()
            expect(panel.get_by_role("switch", name="在新标签页打开网站")).to_be_in_viewport()
            close(page)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            screenshot(page, "mobile-scrolled")
            page.evaluate("window.scrollTo(0, 0)")
    assert not external, f"Unexpected remote requests: {external}"
    # Check Enter navigation after measuring passive page traffic.
    page.set_viewport_size({"width": 1586, "height": 992})
    context.route("https://figma.com/**", lambda route: route.fulfill(status=200, body="test destination"))
    search.fill("figma")
    with page.expect_popup() as opened:
        search.press("Enter")
    popup = opened.value
    popup.wait_for_load_state()
    assert popup.url.startswith("https://figma.com")
    popup.close()
    assert not errors, errors
    context.close()
    print("PASS preview: search, keyboard, menus, pin persistence, nested dialogs, settings, wallpaper, 5 viewport widths, offline assets")

def test_extension(playwright, executable):
    with tempfile.TemporaryDirectory(prefix="qiye-extension-test-") as profile:
        extension = ROOT / "dist"
        context = playwright.chromium.launch_persistent_context(profile, executable_path=executable,
            channel="chromium", headless=True, viewport={"width": 1586, "height": 992},
            args=[f"--disable-extensions-except={extension}", f"--load-extension={extension}"])
        worker = context.service_workers[0] if context.service_workers else context.wait_for_event("serviceworker")
        extension_id = worker.url.split("/")[2]
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"chrome-extension://{extension_id}/index.html")
        page.wait_for_load_state("networkidle")
        expect(page.locator(".bookmark-tile")).to_have_count(0)
        ids = page.evaluate("""async () => {
          const root = (await chrome.bookmarks.getTree())[0].children[0].id;
          const folder = await chrome.bookmarks.create({parentId: root, title: '测试设计'});
          const empty = await chrome.bookmarks.create({parentId: folder.id, title: '空文件夹'});
          const first = await chrome.bookmarks.create({parentId: folder.id, title: '测试 Figma', url: 'https://example.invalid/figma'});
          const unsafe = await chrome.bookmarks.create({parentId: folder.id, title: '危险脚本', url: 'javascript:alert(1)'});
          return {root, folder: folder.id, first: first.id, unsafe: unsafe.id, empty: empty.id};
        }""")
        expect(page.locator('.bookmark-link').filter(has_text="测试 Figma")).to_have_count(1)
        unsafe = page.locator('.bookmark-link').filter(has_text="危险脚本")
        expect(unsafe).to_have_attribute("aria-disabled", "true")
        assert unsafe.get_attribute("href") is None
        page.get_by_role("button", name="测试设计", exact=True).click()
        expect(page.get_by_role("button", name="展开空文件夹", exact=True)).to_be_visible()
        page.get_by_role("button", name="全部书签", exact=True).click()
        before = page.evaluate("chrome.bookmarks.getTree()")
        page.get_by_role("button", name="测试 Figma的操作", exact=True).click()
        page.get_by_role("menuitem", name="固定到常用").click()
        expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(1)
        assert before == page.evaluate("chrome.bookmarks.getTree()"), "Pinning modified source bookmarks"
        page.reload()
        expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(1)
        other = context.new_page()
        other.goto(f"chrome-extension://{extension_id}/index.html")
        expect(other.locator(".pinned-grid .bookmark-tile")).to_have_count(1)
        panel = settings(page)
        panel.get_by_role("button", name="深色", exact=True).click()
        expect(other.locator("html")).to_have_attribute("data-theme", "dark")
        # A failed write must roll back the optimistic UI and keep the last stored preferences.
        page.evaluate("() => { window.originalSet = chrome.storage.local.set; chrome.storage.local.set = async () => { throw Error('test quota failure') }; }")
        panel.get_by_role("switch", name="显示时间", exact=True).click()
        expect(panel.locator(".settings-footer [role=status]")).to_contain_text("设置保存失败")
        expect(panel.get_by_role("switch", name="显示时间", exact=True)).to_have_attribute("aria-checked", "true")
        page.evaluate("() => { chrome.storage.local.set = window.originalSet; }")
        panel.get_by_role("button", name="恢复默认", exact=True).click()
        close(page)
        page.evaluate("async id => chrome.bookmarks.update(id, {title: '已改名'})", ids["first"])
        expect(page.locator(".folder-panel .bookmark-link").filter(has_text="已改名")).to_have_count(1)
        page.evaluate("async ids => chrome.bookmarks.move(ids.first, {parentId: ids.empty})", ids)
        expect(page.locator(".folder-panel").filter(has_text="空文件夹").get_by_text("已改名", exact=True)).to_be_visible()
        page.evaluate("async id => chrome.bookmarks.remove(id)", ids["first"])
        expect(page.locator(".pinned-grid .bookmark-tile")).to_have_count(0)
        expect(page.get_by_text("已改名", exact=True)).to_have_count(0)
        page.evaluate("""async parentId => {
          const large = await chrome.bookmarks.create({parentId, title:'大量书签'});
          for(let i=0;i<130;i++) await chrome.bookmarks.create({parentId:large.id,title:`批量站点 ${i}`,url:`https://example.invalid/${i}`});
        }""", ids["root"])
        page.get_by_role("button", name="展开大量书签", exact=True).click()
        folder = page.get_by_role("dialog").filter(has_text="大量书签")
        expect(folder.locator(".bookmark-tile")).to_have_count(120)
        folder.get_by_role("button", name="显示更多", exact=True).click()
        expect(folder.locator(".bookmark-tile")).to_have_count(130)
        close(page)
        page.get_by_role("combobox", name="搜索书签").fill("批量")
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(120)
        page.get_by_role("button", name="显示更多", exact=True).click()
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(130)
        close(page)
        page.goto("chrome://newtab/")
        expect(page.locator(".brand")).to_contain_text("栖页")
        screenshot(page, "extension")
        assert not errors, errors
        context.close()
        print("PASS actual extension: empty data, native bookmarks/events, nested empty folders, safe URLs, persistent pins, cross-tab settings, failed-save rollback, 120-item pagination, new-tab override")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:5177")
    parser.add_argument("--browser", help="Optional Chrome for Testing/Chromium executable")
    parser.add_argument("--extension", action="store_true", help="Also test the built dist extension in a temporary profile")
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=args.browser)
        try: test_preview(browser, args.url)
        finally: browser.close()
        if args.extension: test_extension(playwright, args.browser)
