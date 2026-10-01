from services.code_analysis import analyze_code, extract_fenced_code, fallback_debug


def test_python_syntax_error_is_confirmed():
    analysis = analyze_code("def broken(:\n    pass\n", "python")
    assert analysis["syntax"]["ok"] is False
    assert analysis["syntax"]["lineno"] is not None


def test_python_eval_is_flagged():
    analysis = analyze_code("def run(x):\n    return eval(x)\n", "python")
    categories = [item["category"] for item in analysis["findings"]]
    assert "security" in categories
    assert any("eval" in item["message"].lower() for item in analysis["findings"])


def test_hardcoded_secret_is_flagged():
    analysis = analyze_code("api_key = 'sk-test-secret'\nprint(api_key)\n", "python")
    assert any(item["severity"] == "high" for item in analysis["findings"])


def test_debug_fallback_labels_syntax():
    result = fallback_debug("def x(:\n  pass", "python", None)
    assert result["kind"] == "syntax"
    assert result["ai_used"] is False


def test_disclaimer_present():
    analysis = analyze_code("print('ok')", "python")
    assert "not a complete security audit" in analysis["disclaimer"].lower()


def test_extract_fenced_code():
    markdown = "Here:\n```python\nprint('hi')\n```\nDone."
    assert extract_fenced_code(markdown) == "print('hi')"


def test_extract_last_fenced_code():
    markdown = "```python\nold()\n```\n```python\nnew()\n```"
    assert extract_fenced_code(markdown, last=True) == "new()"


def test_fallback_unit_tests_from_ast():
    from services.code_analysis import fallback_unit_tests

    result = fallback_unit_tests("def add(a, b):\n    return a + b\n", "python")
    assert "test_add_typical" in (result["code"] or "")
    assert result["ai_used"] is False
