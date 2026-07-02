"""Helpers for working with the Tiptap/ProseMirror JSON document.

The document is the source of truth; these functions derive denormalized data
(plain text, reading time, referenced media ids) from it so we never full-text
search raw JSON.
"""
from __future__ import annotations

from typing import Iterable

WORDS_PER_MINUTE = 220


def iter_nodes(doc: dict) -> Iterable[dict]:
    """Depth-first walk over every node in a Tiptap document."""
    if not isinstance(doc, dict):
        return
    stack = [doc]
    while stack:
        node = stack.pop()
        if not isinstance(node, dict):
            continue
        yield node
        content = node.get("content")
        if isinstance(content, list):
            # Reversed so iteration order stays document order.
            stack.extend(reversed(content))


def extract_text(doc: dict) -> str:
    """Join the text of all text nodes, inserting breaks between blocks."""
    if not isinstance(doc, dict):
        return ""
    parts: list[str] = []
    block_types = {"paragraph", "heading", "listItem", "blockquote", "codeBlock"}
    for node in iter_nodes(doc):
        node_type = node.get("type")
        if node_type == "text" and node.get("text"):
            parts.append(node["text"])
        elif node_type in block_types:
            parts.append("\n")
    text = "".join(parts)
    return "\n".join(line.strip() for line in text.splitlines() if line.strip()).strip()


def estimate_reading_time(text: str) -> int:
    words = len(text.split())
    if not words:
        return 0
    return max(1, round(words / WORDS_PER_MINUTE))


def collect_asset_ids(doc: dict) -> set[int]:
    """Gather every media asset id referenced by blocks in the document."""
    ids: set[int] = set()
    for node in iter_nodes(doc):
        attrs = node.get("attrs") or {}
        asset_id = attrs.get("assetId")
        if isinstance(asset_id, int):
            ids.add(asset_id)
        asset_ids = attrs.get("assetIds")
        if isinstance(asset_ids, list):
            ids.update(a for a in asset_ids if isinstance(a, int))
    return ids
