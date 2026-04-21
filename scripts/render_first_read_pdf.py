#!/usr/bin/env python3
import io
import json
import sys
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

PAGE_W, PAGE_H = LETTER
MARGIN_X = 54
MARGIN_Y = 54
CONTENT_W = PAGE_W - MARGIN_X * 2

COLORS = {
    "bg": HexColor("#07070A"),
    "panel": HexColor("#101014"),
    "line": HexColor("#24262C"),
    "text": HexColor("#F4F5F8"),
    "soft": HexColor("#C8CBD4"),
    "faint": HexColor("#7B7F89"),
    "accent": HexColor("#6FE0C2"),
    "warn": HexColor("#E8B04C"),
}


def norm(value):
    return str(value or "").strip()


def score_rows(result):
    return [
        ("Positioning clarity", int(result.get("positioningClarity", 0) or 0)),
        ("Offer specificity", int(result.get("offerSpecificity", 0) or 0)),
        ("AI discoverability", int(result.get("toneCoherence", 0) or 0)),
        ("Visual credibility", int(result.get("visualCredibility", 0) or 0)),
        ("Conversion readiness", int(result.get("conversionReadiness", 0) or 0)),
    ]


def draw_wrapped(c, text, x, top, width, font, size, color, leading=None):
    text = norm(text)
    if not text:
        return top
    leading = leading or size * 1.35
    lines = simpleSplit(text, font, size, width)
    c.setFillColor(color)
    c.setFont(font, size)
    y = top
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_section(c, y, label, body, color=None):
    body = norm(body)
    if not body:
        return y

    needed = 70 + max(0, (len(simpleSplit(body, "Helvetica", 11.5, CONTENT_W)) - 2) * 15)
    if y - needed < MARGIN_Y:
        c.showPage()
        paint_background(c)
        y = PAGE_H - MARGIN_Y

    c.setFillColor(COLORS["faint"])
    c.setFont("Helvetica", 9.5)
    c.drawString(MARGIN_X, y, label.upper())
    y -= 20
    y = draw_wrapped(
        c,
        body,
        MARGIN_X,
        y,
        CONTENT_W,
        "Helvetica",
        11.5,
        color or COLORS["text"],
        15.5,
    )
    return y - 14


def paint_background(c):
    c.setFillColor(COLORS["bg"])
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def render(payload):
    result = payload.get("result", {}) or {}
    url = norm(payload.get("url"))

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=LETTER)
    paint_background(c)

    y = PAGE_H - MARGIN_Y

    c.setFillColor(COLORS["faint"])
    c.setFont("Helvetica", 9.5)
    c.drawString(MARGIN_X, y, "BRANDMIRROR / FREE FIRST READ")
    if url:
        c.drawRightString(PAGE_W - MARGIN_X, y, url)
    y -= 28

    c.setFillColor(COLORS["text"])
    c.setFont("Times-Bold", 28)
    c.drawString(MARGIN_X, y, norm(result.get("brandName")) or "Brand")
    y -= 22

    c.setFillColor(COLORS["accent"])
    c.setFont("Helvetica", 10.5)
    c.drawString(MARGIN_X, y, norm(result.get("title")))
    y -= 18

    y = draw_wrapped(
        c,
        norm(result.get("tagline")),
        MARGIN_X,
        y,
        CONTENT_W,
        "Times-Roman",
        16,
        COLORS["soft"],
        19,
    )
    y -= 16

    c.setFillColor(COLORS["panel"])
    c.roundRect(MARGIN_X, y - 82, CONTENT_W, 92, 18, fill=1, stroke=0)
    c.setFillColor(COLORS["faint"])
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_X + 20, y - 16, "POSTER SCORE")
    c.setFillColor(COLORS["accent"])
    c.setFont("Times-Bold", 38)
    c.drawString(MARGIN_X + 20, y - 56, str(int(result.get("posterScore", 0) or 0)))
    c.setFillColor(COLORS["text"])
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN_X + 126, y - 34, norm(result.get("scoreBand")))
    y = draw_wrapped(
        c,
        norm(result.get("scoreModifier")),
        MARGIN_X + 126,
        y - 52,
        CONTENT_W - 146,
        "Helvetica",
        10,
        COLORS["soft"],
        13,
    )
    y -= 12

    for label, value in score_rows(result):
        if y < 120:
            c.showPage()
            paint_background(c)
            y = PAGE_H - MARGIN_Y
        c.setFillColor(COLORS["faint"])
        c.setFont("Helvetica", 9.5)
        c.drawString(MARGIN_X, y, label.upper())
        line_left = MARGIN_X + 190
        line_right = PAGE_W - MARGIN_X - 42
        c.setStrokeColor(COLORS["line"])
        c.setLineWidth(5)
        c.line(line_left, y + 2, line_right, y + 2)
        c.setStrokeColor(COLORS["accent"])
        c.line(line_left, y + 2, line_left + ((line_right - line_left) * value / 100.0), y + 2)
        c.setFillColor(COLORS["text"])
        c.setFont("Helvetica-Bold", 10.5)
        c.drawRightString(PAGE_W - MARGIN_X, y - 3, str(value))
        y -= 24

    y -= 10
    sections = [
        ("What the company appears to do", result.get("whatItDoes"), None),
        ("First diagnosis", result.get("summary"), None),
        ("Current read", result.get("current"), None),
        ("Strongest signal", result.get("strongestSignal"), COLORS["accent"]),
        ("Main friction", result.get("mainFriction"), COLORS["warn"]),
        ("One next move", result.get("nextMove"), None),
        ("What already feels strong", result.get("strength"), None),
        ("What is missing", result.get("gap"), None),
        ("What feels out of sync", result.get("mismatch"), None),
        ("Tone read", result.get("voice"), None),
        ("Direction", result.get("direction"), None),
    ]
    for label, body, color in sections:
        y = draw_section(c, y, label, body, color)

    c.setFillColor(COLORS["faint"])
    c.setFont("Helvetica", 9)
    c.drawCentredString(PAGE_W / 2, 24, "Powered by BrandMirror")
    c.save()
    return buffer.getvalue()


def main():
    payload = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    sys.stdout.buffer.write(render(payload))


if __name__ == "__main__":
    main()
