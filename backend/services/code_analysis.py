"""Heuristic and AST-based code analysis. These checks are educational, not a full audit."""

from __future__ import annotations

import ast
import re
from dataclasses import dataclass, asdict


@dataclass
class Finding:
    severity: str  # high | medium | low | info
    category: str
    message: str
    line: int | None = None
    snippet: str | None = None
    suggestion: str | None = None


def findings_to_text(findings: list[Finding]) -> str:
    if not findings:
        return "No heuristic issues were flagged."
    lines = []
    for item in findings:
        location = f" line {item.line}" if item.line else ""
        lines.append(f"- [{item.severity}] {item.category}{location}: {item.message}")
        if item.suggestion:
            lines.append(f"  Suggestion: {item.suggestion}")
    return "\n".join(lines)


def analyze_code(code: str, language: str = "python") -> dict:
    language = (language or "python").lower()
    findings: list[Finding] = []
    syntax = {"ok": True, "error": None, "lineno": None}

    if language == "python":
        syntax = _python_syntax(code)
        findings.extend(_python_ast_findings(code))
        findings.extend(_python_pattern_findings(code))
    else:
        findings.extend(_generic_pattern_findings(code, language))

    findings.extend(_shared_security_patterns(code, language))

    return {
        "language": language,
        "syntax": syntax,
        "findings": [asdict(item) for item in findings],
        "summary": findings_to_text(findings),
        "disclaimer": (
            "These are heuristic and AST-based checks for teaching. "
            "They are not a complete security audit or a substitute for tests."
        ),
    }


def _python_syntax(code: str) -> dict:
    try:
        ast.parse(code)
        return {"ok": True, "error": None, "lineno": None}
    except SyntaxError as exc:
        return {
            "ok": False,
            "error": exc.msg,
            "lineno": exc.lineno,
            "text": exc.text.strip() if exc.text else None,
        }


def _python_ast_findings(code: str) -> list[Finding]:
    findings: list[Finding] = []
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return findings

    assigned: set[str] = set()
    used: set[str] = set()

    class Visitor(ast.NodeVisitor):
        def visit_Assign(self, node: ast.Assign) -> None:
            for target in node.targets:
                if isinstance(target, ast.Name):
                    assigned.add(target.id)
            self.generic_visit(node)

        def visit_Name(self, node: ast.Name) -> None:
            if isinstance(node.ctx, ast.Load):
                used.add(node.id)
            self.generic_visit(node)

        def visit_Call(self, node: ast.Call) -> None:
            func = node.func
            name = func.id if isinstance(func, ast.Name) else None
            attr = func.attr if isinstance(func, ast.Attribute) else None
            risky = {name, attr}
            if "eval" in risky or "exec" in risky:
                findings.append(
                    Finding(
                        severity="high",
                        category="security",
                        message="Use of eval/exec can run untrusted code.",
                        line=getattr(node, "lineno", None),
                        snippet=_line_at(code, getattr(node, "lineno", None)),
                        suggestion="Avoid eval/exec; parse data with json or ast.literal_eval when possible.",
                    )
                )
            if attr == "loads" and isinstance(func, ast.Attribute):
                value = func.value
                if isinstance(value, ast.Name) and value.id == "pickle":
                    findings.append(
                        Finding(
                            severity="high",
                            category="security",
                            message="pickle.loads can execute arbitrary objects.",
                            line=getattr(node, "lineno", None),
                            snippet=_line_at(code, getattr(node, "lineno", None)),
                            suggestion="Prefer json for untrusted data.",
                        )
                    )
            if name == "input" or attr == "input":
                parent_calls = True
                if parent_calls:
                    findings.append(
                        Finding(
                            severity="low",
                            category="quality",
                            message="Raw input() is used; validate and sanitise user input.",
                            line=getattr(node, "lineno", None),
                            snippet=_line_at(code, getattr(node, "lineno", None)),
                            suggestion="Validate types and ranges before using input values.",
                        )
                    )
            self.generic_visit(node)

        def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
            if node.type is None:
                findings.append(
                    Finding(
                        severity="medium",
                        category="quality",
                        message="Bare except: hides unexpected errors.",
                        line=getattr(node, "lineno", None),
                        snippet=_line_at(code, getattr(node, "lineno", None)),
                        suggestion="Catch specific exceptions.",
                    )
                )
            self.generic_visit(node)

        def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
            if len(node.body) > 40:
                findings.append(
                    Finding(
                        severity="low",
                        category="readability",
                        message=f"Function '{node.name}' is long ({len(node.body)} statements).",
                        line=node.lineno,
                        suggestion="Split into smaller functions with clear names.",
                    )
                )
            arg_names = [arg.arg for arg in node.args.args]
            if any(len(name) <= 1 and name not in {"i", "j", "k", "n", "x", "y"} for name in arg_names):
                findings.append(
                    Finding(
                        severity="low",
                        category="naming",
                        message=f"Function '{node.name}' has very short parameter names.",
                        line=node.lineno,
                        suggestion="Use descriptive names unless the name is a conventional loop index.",
                    )
                )
            self.generic_visit(node)

        def visit_If(self, node: ast.If) -> None:
            depth = _nested_if_depth(node)
            if depth >= 3:
                findings.append(
                    Finding(
                        severity="low",
                        category="readability",
                        message="Deeply nested conditions can be simplified.",
                        line=node.lineno,
                        suggestion="Use early returns or extract helper predicates.",
                    )
                )
            self.generic_visit(node)

    Visitor().visit(tree)

    builtins_like = {
        "print",
        "len",
        "range",
        "int",
        "str",
        "list",
        "dict",
        "set",
        "tuple",
        "True",
        "False",
        "None",
        "self",
        "cls",
    }
    unused = sorted(name for name in assigned - used if not name.startswith("_") and name not in builtins_like)
    for name in unused[:8]:
        findings.append(
            Finding(
                severity="low",
                category="quality",
                message=f"Assigned name '{name}' is never read.",
                suggestion="Remove unused variables or use them.",
            )
        )
    return findings


def _nested_if_depth(node: ast.If, depth: int = 1) -> int:
    nested = depth
    for child in node.body:
        if isinstance(child, ast.If):
            nested = max(nested, _nested_if_depth(child, depth + 1))
    return nested


def _python_pattern_findings(code: str) -> list[Finding]:
    findings: list[Finding] = []
    for index, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        if re.search(r"os\.system\(|subprocess\.(call|run|Popen)\([^)]*shell\s*=\s*True", stripped):
            findings.append(
                Finding(
                    severity="high",
                    category="security",
                    message="Shell command execution detected.",
                    line=index,
                    snippet=stripped,
                    suggestion="Avoid shell=True and never interpolate untrusted strings into commands.",
                )
            )
        if "== None" in stripped or "!= None" in stripped:
            findings.append(
                Finding(
                    severity="low",
                    category="style",
                    message="Compare to None with 'is' / 'is not'.",
                    line=index,
                    snippet=stripped,
                    suggestion="Use 'x is None' instead of 'x == None'.",
                )
            )
    return findings


def _generic_pattern_findings(code: str, language: str) -> list[Finding]:
    findings: list[Finding] = []
    for index, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        if language in {"javascript", "java", "c", "cpp"} and re.search(r"==\s*true|==\s*false", stripped, re.I):
            findings.append(
                Finding(
                    severity="low",
                    category="style",
                    message="Boolean comparison can usually be simplified.",
                    line=index,
                    snippet=stripped,
                    suggestion="Use the boolean value directly.",
                )
            )
        if language == "javascript" and "var " in stripped:
            findings.append(
                Finding(
                    severity="low",
                    category="style",
                    message="Prefer let/const over var.",
                    line=index,
                    snippet=stripped,
                )
            )
        if language == "sql" and re.search(r"select\s+\*", stripped, re.I):
            findings.append(
                Finding(
                    severity="low",
                    category="quality",
                    message="SELECT * can fetch unused columns.",
                    line=index,
                    snippet=stripped,
                    suggestion="List only the columns you need.",
                )
            )
    return findings


def _shared_security_patterns(code: str, language: str) -> list[Finding]:
    findings: list[Finding] = []
    for index, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        if re.search(r"(password|api_key|secret)\s*=\s*['\"][^'\"]+['\"]", stripped, re.I):
            findings.append(
                Finding(
                    severity="high",
                    category="security",
                    message="Possible hardcoded secret.",
                    line=index,
                    snippet="[redacted]",
                    suggestion="Load secrets from environment variables, never from source code.",
                )
            )
        if language == "sql" or "SELECT" in stripped.upper():
            if re.search(r"(['\"].*\+|f['\"].*SELECT|%\s*\(|format\()", stripped, re.I) and "SELECT" in stripped.upper():
                findings.append(
                    Finding(
                        severity="high",
                        category="security",
                        message="Possible SQL string concatenation (injection risk).",
                        line=index,
                        snippet=stripped[:120],
                        suggestion="Use parameterized queries.",
                    )
                )
        if "innerHTML" in stripped:
            findings.append(
                Finding(
                    severity="medium",
                    category="security",
                    message="innerHTML can introduce XSS if the value is untrusted.",
                    line=index,
                    snippet=stripped,
                    suggestion="Use textContent or a sanitizer for untrusted HTML.",
                )
            )
    return findings


def extract_fenced_code(markdown: str | None, *, last: bool = False) -> str | None:
    """Return a fenced code block so the UI can copy generated code.

    Refactor replies usually put original code first and the proposal last.
    """
    if not markdown:
        return None
    matches = re.findall(r"```(?:[\w+-]*)\n(.*?)```", markdown, re.DOTALL)
    if not matches:
        return None
    snippet = (matches[-1] if last else matches[0]).strip()
    return snippet or None


def _line_at(code: str, lineno: int | None) -> str | None:
    if not lineno:
        return None
    lines = code.splitlines()
    if 1 <= lineno <= len(lines):
        return lines[lineno - 1].strip()
    return None


def fallback_debug(code: str, language: str, error_message: str | None) -> dict:
    analysis = analyze_code(code, language)
    syntax = analysis["syntax"]
    if language == "python" and not syntax.get("ok"):
        explanation = (
            f"Confirmed Python syntax error on line {syntax.get('lineno')}: {syntax.get('error')}."
        )
        kind = "syntax"
    else:
        explanation = (
            "No confirmed syntax error from static analysis. "
            "Any remaining issues are possible logic bugs and need tests or an LLM to inspect further."
        )
        kind = "possible_logic"
        if error_message:
            explanation += f" Reported runtime message: {error_message}"

    return {
        "kind": kind,
        "explanation": explanation,
        "analysis": analysis,
        "corrected_code": None,
        "ai_used": False,
        "setup_required": True,
        "message": (
            "AI debugging is unavailable because no LLM API key is configured. "
            "Static analysis still ran. Add LLM_API_KEY in .env to enable suggested fixes."
        ),
    }


def fallback_unit_tests(code: str, language: str) -> dict:
    """Draft pytest stubs from Python AST names. Does not execute user code."""
    if language != "python":
        return {
            "reply": None,
            "code": None,
            "ai_used": False,
            "setup_required": True,
            "message": (
                "Stub tests without an API key are only generated for Python. "
                "Set LLM_API_KEY for other languages. Submitted code was not executed."
            ),
        }

    syntax = _python_syntax(code)
    if not syntax.get("ok"):
        return {
            "reply": (
                f"Cannot draft tests: confirmed Python syntax error on line "
                f"{syntax.get('lineno')}: {syntax.get('error')}."
            ),
            "code": None,
            "ai_used": False,
            "setup_required": True,
            "message": "Fix the syntax error, or add LLM_API_KEY for model-generated tests.",
        }

    tree = ast.parse(code)
    functions: list[ast.FunctionDef] = []
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and not node.name.startswith("_"):
            functions.append(node)
        elif isinstance(node, ast.ClassDef):
            for item in node.body:
                if (
                    isinstance(item, ast.FunctionDef)
                    and not item.name.startswith("_")
                    and item.name != "__init__"
                ):
                    functions.append(item)

    if not functions:
        return {
            "reply": (
                "No public Python functions were found to stub. "
                "Add LLM_API_KEY for richer tests, or paste a function definition."
            ),
            "code": None,
            "ai_used": False,
            "setup_required": True,
        }

    lines = [
        "# Draft pytest stubs from function names only.",
        "# CodeMate did not execute this code. Replace '...' with real values.",
        "import pytest",
        "",
    ]
    for func in functions:
        arg_names = [arg.arg for arg in func.args.args if arg.arg not in {"self", "cls"}]
        call_args = ", ".join("..." for _ in arg_names) if arg_names else ""
        lines.extend(
            [
                f"def test_{func.name}_typical():",
                f"    result = {func.name}({call_args})",
                "    assert result == ...  # expected typical output",
                "",
                f"def test_{func.name}_boundary():",
                "    # empty input, 0, or max-size value",
                f"    result = {func.name}({call_args})",
                "    assert result == ...",
                "",
                f"def test_{func.name}_invalid():",
                "    with pytest.raises(Exception):",
                f"        {func.name}({call_args or '...'})",
                "",
            ]
        )
    stub = "\n".join(lines).rstrip() + "\n"
    reply = (
        "Local pytest stubs (no LLM). These are templates, not verified assertions.\n\n"
        f"```python\n{stub}```"
    )
    return {
        "reply": reply,
        "code": stub,
        "ai_used": False,
        "setup_required": True,
        "message": "Submitted code was not executed. Fill in expected outputs before running pytest yourself.",
    }


def fallback_review(code: str, language: str) -> dict:
    analysis = analyze_code(code, language)
    return {
        "analysis": analysis,
        "ai_used": False,
        "setup_required": True,
        "narrative": (
            "AI review is unavailable without an API key. "
            "The findings below come from CodeMate's local heuristic checks only."
        ),
        "disclaimer": analysis["disclaimer"],
    }
