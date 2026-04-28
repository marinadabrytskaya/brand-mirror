#!/usr/bin/env python3
from __future__ import annotations

import base64
import io
import json
import math
import sys
import urllib.request
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PAGE_W, PAGE_H = A4
MARGIN_X = 56
CONTENT_W = PAGE_W - MARGIN_X * 2

COLORS = {
    "dark": HexColor("#11131A"),
    "dark_soft": HexColor("#66748B"),
    "paper": HexColor("#121620"),
    "paper_soft": HexColor("#5E6B82"),
    "ink": HexColor("#F3F3F2"),
    "text": HexColor("#F3F3F2"),
    "muted_dark": HexColor("#D6DBE4"),
    "muted_light": HexColor("#C1CBD9"),
    "accent": HexColor("#D8C5E0"),
    "terracotta": HexColor("#7B9AA1"),
    "success": HexColor("#7B9AA1"),
    "rule": HexColor("#2B3342"),
}

COPY = {
    "en": {
        "brandmirror_report": "BRANDMIRROR REPORT",
        "what_is_label": "WHAT THIS REPORT IS",
        "what_is_title": "A commercial diagnostic built to close the gap between perception and conversion",
        "report_snapshot": "REPORT SNAPSHOT",
        "overall_readiness": "Overall brand readiness",
        "score_label": "SCORE DASHBOARD",
        "score_title": "See exactly what is working, what is broken, and why clients still hesitate",
        "score_share": "Share your score and tag @brandmirror.",
        "method_label": "HOW BRANDMIRROR SCORES YOUR BRAND",
        "method_title": "What each score measures and why the numbers matter",
        "website_label": "CURRENT WEBSITE SURFACE",
        "website_title": "What the buyer sees before the copy has earned trust",
        "axis_reveal": "MOST REVEALING LINE",
        "benchmark": "Benchmark",
        "archetype_label": "BRAND ARCHETYPE",
        "gap_label": "THE GAP DIAGNOSIS",
        "fix_label": "PRIORITY FIX STACK",
        "plan7": "7-DAY ACTION PLAN",
        "plan30": "30-DAY ACTION PLAN",
        "next_label": "WHAT COMES NEXT",
        "back_cover": "Your brand is already speaking.\nThis is what it is saying.",
        "powered": "Powered by Sahar",
    },
    "ru": {
        "brandmirror_report": "ОТЧЁТ BRANDMIRROR",
        "what_is_label": "ЧТО ЭТО ЗА ОТЧЁТ",
        "what_is_title": "Коммерческий диагноз, который закрывает разрыв между восприятием и конверсией",
        "report_snapshot": "СНИМОК ОТЧЁТА",
        "overall_readiness": "Общая готовность бренда",
        "score_label": "ПАНЕЛЬ SCORES",
        "score_title": "Увидь точно, что работает, что ломается и почему клиент всё ещё сомневается",
        "score_share": "Поделись своим score и отметь @brandmirror.",
        "method_label": "КАК BRANDMIRROR ОЦЕНИВАЕТ БРЕНД",
        "method_title": "Что измеряет каждый score и почему этим цифрам можно доверять",
        "website_label": "ТЕКУЩАЯ ПОВЕРХНОСТЬ САЙТА",
        "website_title": "Что видит покупатель до того, как текст успевает заслужить доверие",
        "axis_reveal": "САМАЯ ПОКАЗАТЕЛЬНАЯ ЛИНИЯ",
        "benchmark": "Ориентир",
        "archetype_label": "АРХЕТИП БРЕНДА",
        "gap_label": "ДИАГНОЗ РАЗРЫВА",
        "fix_label": "СТЕК ПРИОРИТЕТНЫХ FIXES",
        "plan7": "ПЛАН НА 7 ДНЕЙ",
        "plan30": "ПЛАН НА 30 ДНЕЙ",
        "next_label": "ЧТО ДАЛЬШЕ",
        "back_cover": "Твой бренд уже говорит.\nВот что он говорит.",
        "powered": "Powered by Sahar",
    },
    "es": {
        "brandmirror_report": "REPORTE BRANDMIRROR",
        "what_is_label": "QUÉ ES ESTE REPORTE",
        "what_is_title": "Un diagnóstico comercial para cerrar la brecha entre percepción y conversión",
        "report_snapshot": "RESUMEN DEL REPORTE",
        "overall_readiness": "Preparación general de la marca",
        "score_label": "PANEL DE SCORES",
        "score_title": "Mira exactamente qué funciona, qué está roto y por qué el cliente todavía duda",
        "score_share": "Comparte tu score y etiqueta a @brandmirror.",
        "method_label": "CÓMO BRANDMIRROR PUNTÚA TU MARCA",
        "method_title": "Qué mide cada score y por qué esos números importan",
        "website_label": "SUPERFICIE ACTUAL DEL SITIO",
        "website_title": "Lo que el comprador ve antes de que el copy gane confianza",
        "axis_reveal": "LÍNEA MÁS REVELADORA",
        "benchmark": "Benchmark",
        "archetype_label": "ARQUETIPO DE MARCA",
        "gap_label": "DIAGNÓSTICO DE LA BRECHA",
        "fix_label": "STACK DE FIXES PRIORITARIOS",
        "plan7": "PLAN DE 7 DÍAS",
        "plan30": "PLAN DE 30 DÍAS",
        "next_label": "QUÉ VIENE DESPUÉS",
        "back_cover": "Tu marca ya está hablando.\nEsto es lo que está diciendo.",
        "powered": "Powered by Sahar",
    },
}

GENRE_BY_ARCHETYPE = {
    "hero": "Epic War Drama",
    "explorer": "Adventure / Road Film",
    "ruler": "Political Thriller",
    "rebel": "Revolution Thriller",
    "innocent": "Coming-of-Age Fairy Tale",
    "lover": "Intimate Romance Drama",
    "sage": "Intellectual Mystery",
    "magician": "Surrealist Sci-Fi",
    "jester": "Dark Comedy",
    "caregiver": "Intimate Family Epic",
    "creator": "Auteur Art House",
    "everyman": "Grounded Character Study",
}

POSTER_MAP = {
    "ruler": "Ruler2.png",
    "sage": "Sage2.png",
    "magician": "Magician2.png",
    "creator": "Creator2.png",
    "lover": "Lover2.png",
    "caregiver": "Caregiver2.png",
    "hero": "Hero2.png",
    "rebel": "Rebel2.png",
    "explorer": "Explorer2.png",
    "everyman": "Everyman2.png",
    "innocent": "Innocent2.png",
    "jester": "Jester2.png",
}

def norm(value):
    if value is None:
        return ""
    return " ".join(str(value).split()).strip()


def trunc(value, length=180):
    value = norm(value)
    if len(value) <= length:
        return value
    return value[: max(0, length - 1)].rstrip() + "…"


def first_sentence(value):
    value = norm(value)
    if not value:
        return ""
    for sep in [". ", "! ", "? "]:
        if sep in value:
            return value.split(sep)[0].strip() + sep.strip()
    return value


def fetch_page_meta(url):
    if not url:
        return {"title": "", "description": ""}
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            html = response.read().decode("utf-8", "ignore")
    except Exception:
        return {"title": "", "description": ""}

    title_match = None
    desc_match = None
    try:
        import re
        title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
        desc_match = re.search(
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
            html,
            re.I | re.S,
        )
    except Exception:
        pass

    return {
        "title": norm(title_match.group(1)) if title_match else "",
        "description": norm(desc_match.group(1)) if desc_match else "",
    }


def derive_specific_hero_line(report):
    rewrite = (report.get("rewriteSuggestions") or {}).get("heroLine", "")
    if not rewrite or not any(
        phrase in rewrite.lower()
        for phrase in [
            "helps clients understand the value faster",
            "without losing the premium feel",
            "clearer offer framing",
            "the value faster",
        ]
    ):
        return None

    meta = fetch_page_meta(report.get("url", ""))
    brand = norm(report.get("brandName", ""))
    candidates = []
    for source in [meta.get("title", ""), meta.get("description", "")]:
        if not source:
            continue
        for segment in source.replace("—", "|").replace("-", "|").split("|"):
            cleaned = norm(segment.replace(brand, "").replace(brand.upper(), ""))
            cleaned = cleaned.strip(" :,-")
            if 18 <= len(cleaned) <= 88 and not any(
                bad in cleaned.lower()
                for bad in ["browse", "shop online", "finance available", "payment plans", "lay-by"]
            ):
                candidates.append(cleaned)

    if not candidates:
        return None

    return trunc(candidates[0].rstrip("."), 88)


def improve_report_copy(report):
    better_hero = derive_specific_hero_line(report)
    rewrite = dict(report.get("rewriteSuggestions") or {})
    if better_hero:
        rewrite["heroLine"] = better_hero
    if not rewrite.get("heroLine"):
        rewrite["heroLine"] = "Make the first line land like a reason to stay, not only a reason to admire."
    if not rewrite.get("subheadline") or "premium feel" in rewrite.get("subheadline", "").lower():
        rewrite["subheadline"] = "State the audience, the shift, and the payoff before the page starts asking for brand trust."
    if not rewrite.get("cta") or rewrite.get("cta") == "See how it works":
        rewrite["cta"] = "Shop the collection"
    report["rewriteSuggestions"] = rewrite

    correction = dict(report.get("headlineCorrection") or {})
    if better_hero:
        correction["rewrittenDirection"] = better_hero
    report["headlineCorrection"] = correction

    before_after = dict(report.get("beforeAfterHero") or {})
    rewritten = dict(before_after.get("rewrittenFrame") or {})
    rewritten["headline"] = rewrite["heroLine"]
    rewritten["subheadline"] = rewrite["subheadline"]
    rewritten["cta"] = rewrite["cta"]
    before_after["rewrittenFrame"] = rewritten
    report["beforeAfterHero"] = before_after
    report["tagline"] = build_poster_tagline(report)
    report["scoreModifier"] = build_poster_modifier(report)
    return report


def load_image(source):
    if not source:
        return None
    if source.startswith("data:"):
        try:
            data = base64.b64decode(source.split(",", 1)[1])
            return ImageReader(io.BytesIO(data))
        except Exception:
            return None
    p = Path(source)
    if p.is_absolute() and p.exists():
        return str(p)
    if source.startswith("/"):
        p = ROOT / "public" / source.lstrip("/")
        if p.exists():
            return str(p)
        return None
    if source.startswith("http://") or source.startswith("https://"):
        try:
            with urllib.request.urlopen(source, timeout=5) as r:
                return ImageReader(io.BytesIO(r.read()))
        except Exception:
            return None
    if p.exists():
        return str(p)
    return None


def lowest_metric_key(report):
    rows = report.get("scorecard", []) or []
    if not rows:
        return "clarity"
    scored = []
    for row in rows:
        label = norm(row.get("label", "")).lower()
        score = int(row.get("score", 0) or 0)
        if "positioning" in label or "clarity" in label:
            key = "clarity"
        elif "visual" in label or "credibility" in label:
            key = "credibility"
        elif "tone" in label or "coherence" in label:
            key = "cohesion"
        elif "offer" in label:
            key = "offer"
        elif "conversion" in label:
            key = "conversion"
        else:
            key = label or "clarity"
        scored.append((score, key))
    scored.sort(key=lambda item: item[0])
    return scored[0][1]


def build_poster_tagline(report):
    world = norm(report.get("visualWorld", "creator")).lower() or "creator"
    lowest = lowest_metric_key(report)
    lines = {
        "hero": {
            "clarity": "The pressure is visible. The next victory still needs a name.",
            "credibility": "The standard is felt first. The evidence still enters second.",
            "cohesion": "They know how to move. The language still flinches.",
            "offer": "The charge is instant. The exact invitation stays just out of view.",
            "conversion": "The message hits hard. The doorway still opens too quietly.",
        },
        "ruler": {
            "clarity": "The room already persuades. The invitation still does not.",
            "credibility": "The power is established. The proof still stays offstage.",
            "cohesion": "The authority is real. The wording still bows too early.",
            "offer": "The standard is set. The proposition still waits outside.",
            "conversion": "The signal is strong. The next move still feels withheld.",
        },
        "sage": {
            "clarity": "The intelligence is obvious. The offer still goes unnamed.",
            "credibility": "The thinking is real. The evidence remains implied.",
            "cohesion": "The knowledge is there. The language still softens the point.",
            "offer": "The answer is near. The invitation still arrives late.",
            "conversion": "The insight lands. The route in still stays too quiet.",
        },
        "creator": {
            "clarity": "The world is authored. The through-line still takes too long.",
            "credibility": "The authorship is clear. The proof stays too quiet.",
            "cohesion": "The vision is strong. The claim still edits itself down.",
            "offer": "The craft is visible. The proposition still lacks a frame.",
            "conversion": "The atmosphere persuades first. The next move still blurs.",
        },
        "magician": {
            "clarity": "The shift is visible. The meaning still slips away.",
            "credibility": "The spell works. The proof remains offstage.",
            "cohesion": "The change is real. The wording still hides the reveal.",
            "offer": "The transformation lands. The promise still keeps its distance.",
            "conversion": "The world is altered. The doorway still stays concealed.",
        },
    }
    fallback = {
        "clarity": "The quality is visible. The reason to enter still stays quiet.",
        "credibility": "The promise feels real. The proof still enters second.",
        "cohesion": "The voice is strong. The through-line still drifts.",
        "offer": "The signal lands first. The proposition still waits behind it.",
        "conversion": "The desire is there. The next step still stays too hidden.",
    }
    return lines.get(world, {}).get(lowest, fallback.get(lowest, fallback["clarity"]))


def build_poster_modifier(report):
    lowest = lowest_metric_key(report)
    lines = {
        "clarity": "They can feel the standard. The reason to step closer is still quieter than it should be.",
        "credibility": "The belief is there. The world around it has not fully caught up yet.",
        "cohesion": "The voice is strong. It still slips between versions of itself.",
        "offer": "The attraction lands first. The exact invitation arrives a beat behind it.",
        "conversion": "The desire is present. The path to yes should feel more inevitable.",
    }
    return lines.get(lowest, lines["clarity"])


def draw_image_cover(c, source, x, y, width, height):
    try:
        reader = ImageReader(source)
        img_w, img_h = reader.getSize()
    except Exception:
        return False

    if not img_w or not img_h:
        return False

    scale = max(width / img_w, height / img_h)
    draw_w = img_w * scale
    draw_h = img_h * scale
    draw_x = x - (draw_w - width) / 2
    draw_y = y - (draw_h - height) / 2
    c.drawImage(reader, draw_x, draw_y, width=draw_w, height=draw_h, mask="auto")
    return True


def poster_source_for(report):
    world = report.get("visualWorld")
    name = POSTER_MAP.get(world)
    if not name:
        name = "Creator2.png"
    local_poster = ROOT / "public" / "poster images" / name
    if local_poster.exists():
        return str(local_poster)

    for item in report.get("surfaceCaptures", []):
        if item.get("kind") == "brand-signal" and item.get("imageUrl"):
            surface = load_image(item["imageUrl"])
            if surface:
                return surface
    return None


def website_surface_source_for(report):
    before = (report.get("beforeAfterHero") or {}).get("currentFrame") or {}
    if before.get("imageUrl"):
        surface = load_image(before.get("imageUrl"))
        if surface:
            return surface

    gallery = report.get("proofGallery", []) or report.get("miniStoryboard", [])
    for item in gallery:
        if item.get("imageUrl"):
            surface = load_image(item.get("imageUrl"))
            if surface:
                return surface

    for item in report.get("surfaceCaptures", []):
        if item.get("kind") == "website" and item.get("imageUrl"):
            surface = load_image(item.get("imageUrl"))
            if surface:
                return surface
    return None


def draw_wrapped(c, text, x, top, width, font, size, color, leading=None, align="left"):
    text = norm(text)
    if not text:
        return top
    leading = leading or size * 1.35
    lines = simpleSplit(text, font, size, width)
    y = top
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        if align == "center":
            c.drawCentredString(x + width / 2, y, line)
        elif align == "right":
            c.drawRightString(x + width, y, line)
        else:
            c.drawString(x, y, line)
        y -= leading
    return y


def fit_text_to_box(text, font, size, width, height, min_size=9.2, leading=None):
    text = norm(text)
    current_size = size
    current_text = text
    while True:
        current_leading = leading or current_size * 1.35
        lines = simpleSplit(current_text, font, current_size, width)
        if len(lines) * current_leading <= height:
            return current_text, current_size, current_leading
        if current_size > min_size:
            current_size = round(current_size - 0.3, 2)
            continue
        if len(current_text) > 48:
            current_text = current_text[:-10].rstrip(" ,.;:") + "…"
            continue
        return current_text, current_size, current_leading


def draw_centered_tracked(c, text, center_x, y, font, size, color, tracking=1.6):
    text = norm(text)
    if not text:
        return
    c.setFont(font, size)
    c.setFillColor(color)
    widths = [pdfmetrics.stringWidth(char, font, size) for char in text]
    total = sum(widths) + max(0, len(text) - 1) * tracking
    x = center_x - total / 2
    for idx, char in enumerate(text):
        c.drawString(x, y, char)
        x += widths[idx] + tracking


def title_card_lines(text):
    words = [word for word in norm(text).upper().split(" ") if word]
    if not words:
        return []
    if len(words) == 1:
        return [" ".join(list(words[0]))]
    if len(words) == 2 and max(len(words[0]), len(words[1])) <= 12:
        return [" ".join(list(words[0])), " ".join(list(words[1]))]
    if len(words) == 3 and words[0] in {"THE", "A"}:
        return [" ".join(list(words[0])), " ".join(list(words[1])), " ".join(list(words[2]))]
    if len(words) == 3:
        return [" ".join(list(" ".join(words[:2]))), " ".join(list(words[2]))]
    return ["   ".join(" ".join(list(word)) for word in words)]


def draw_title_card(c, text, center_x, top_y, max_width, color):
    lines = title_card_lines(text)
    if not lines:
        return top_y
    size = 34
    tracking = 1.0
    while size > 20:
        widest = max(pdfmetrics.stringWidth(line, "Helvetica", size) for line in lines)
        if widest <= max_width:
            break
        size -= 1
    y = top_y
    for line in lines:
        draw_centered_tracked(c, line, center_x, y, "Helvetica", size, color, tracking)
        y -= size * 1.15
    return y


def draw_page_shell(c, page_no, total_pages, dark=False):
    bg = COLORS["dark"] if dark else COLORS["paper"]
    fg = COLORS["muted_dark"] if dark else COLORS["muted_light"]
    rule = HexColor("#4A433A") if dark else COLORS["rule"]
    c.setFillColor(bg)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(COLORS["accent"])
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_X, PAGE_H - 38, "BRANDMIRROR")
    c.setFillColor(fg)
    c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 38, f"{page_no:02d} / {total_pages:02d}")
    c.setStrokeColor(rule)
    c.setLineWidth(0.8)
    c.line(MARGIN_X, 66, PAGE_W - MARGIN_X, 66)


def draw_page_label(c, label, title, dark=False):
    title_color = COLORS["text"] if dark else COLORS["ink"]
    c.setFillColor(COLORS["accent"])
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN_X, PAGE_H - 78, label)
    c.setFillColor(title_color)
    return draw_wrapped(c, title, MARGIN_X, PAGE_H - 108, CONTENT_W - 40, "Times-Bold", 27, title_color, 30)


def draw_cover(c, report, copy, report_id):
    c.setFillColor(COLORS["dark"])
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(COLORS["accent"])
    c.setFont("Helvetica", 9)
    c.drawString(52, PAGE_H - 54, "BRANDMIRROR REPORT")

    brand_name = report.get("brandName", "Brand")
    draw_wrapped(c, brand_name, 64, 616, PAGE_W - 128, "Times-Bold", 42, COLORS["text"], 44, "center")
    draw_wrapped(c, "A diagnostic read of what the brand signals, where it loses clarity, and what to fix next.", 120, 548, PAGE_W - 240, "Helvetica", 11.8, COLORS["muted_dark"], 16, "center")

    c.setStrokeColor(COLORS["rule"])
    c.setLineWidth(1)
    c.line(164, 504, PAGE_W - 164, 504)

    left_x = 84
    right_x = 334
    draw_wrapped(c, "Report Snapshot", left_x, 464, 180, "Helvetica", 8.8, COLORS["accent"], 12)
    draw_wrapped(c, f"{report.get('posterScore', 0)}/100", left_x, 430, 180, "Times-Bold", 28, COLORS["text"], 30)
    draw_wrapped(c, "Overall brand readiness", left_x, 396, 180, "Helvetica", 11, COLORS["muted_dark"], 14)

    draw_wrapped(c, "What this report does", right_x, 464, 180, "Helvetica", 8.8, COLORS["accent"], 12)
    what_it_does = (
        "It shows what the brand is communicating before the buyer has fully decided to stay, trust, or act."
    )
    draw_wrapped(c, what_it_does, right_x, 432, 180, "Helvetica", 11, COLORS["muted_dark"], 15)

    verdict = trunc(report.get("scoreModifier", ""), 150)
    c.setFillColor(COLORS["dark_soft"])
    c.roundRect(64, 188, PAGE_W - 128, 136, 18, stroke=0, fill=1)
    draw_wrapped(c, "Opening verdict", 86, 298, PAGE_W - 172, "Helvetica", 8.8, COLORS["accent"], 12)
    draw_wrapped(c, verdict, 86, 268, PAGE_W - 172, "Times-Italic", 18, COLORS["text"], 22, "center")

    url = report.get("url", "")
    draw_wrapped(c, url, MARGIN_X, 78, CONTENT_W, "Helvetica", 8.8, COLORS["muted_dark"], 11, "center")
    c.setStrokeColor(COLORS["accent"])
    c.setLineWidth(1)
    c.line(MARGIN_X, 46, PAGE_W - MARGIN_X, 46)
    c.setFillColor(COLORS["muted_dark"])
    c.setFont("Helvetica", 8.2)
    c.drawString(MARGIN_X, 28, copy["powered"])
    c.drawRightString(PAGE_W - MARGIN_X, 28, report_id)


def draw_score_dashboard(c, report, copy, total_pages):
    draw_page_shell(c, 4, total_pages, dark=False)
    draw_page_label(c, copy["score_label"], copy["score_title"], dark=False)
    cards = report.get("scorecard", [])[:5]
    avg = int(report.get("posterScore") or round(sum(int(i.get("score", 0)) for i in cards) / max(1, len(cards))))
    verdict = trunc(report.get("scoreModifier", ""), 110)

    c.setFillColor(COLORS["dark_soft"])
    c.roundRect(MARGIN_X, 358, CONTENT_W, 248, 18, stroke=0, fill=1)
    draw_wrapped(c, f"{avg}/100", MARGIN_X, 564, CONTENT_W, "Times-Bold", 54, COLORS["text"], 58, "center")
    draw_wrapped(c, "Overall brand readiness", MARGIN_X, 480, CONTENT_W, "Helvetica", 13, COLORS["muted_dark"], 16, "center")
    draw_wrapped(c, verdict, MARGIN_X + 62, 430, CONTENT_W - 124, "Times-Italic", 17, COLORS["text"], 20, "center")

    card_w = (CONTENT_W - 24) / 5
    x = MARGIN_X
    for idx, item in enumerate(cards):
        c.setFillColor(HexColor("#221E1A"))
        c.roundRect(x, 188, card_w, 124, 14, stroke=0, fill=1)
        draw_wrapped(c, item.get("label", "").upper(), x + 12, 292, card_w - 24, "Helvetica", 7.8, COLORS["muted_dark"], 9, "center")
        draw_wrapped(c, str(item.get("score", "")), x + 12, 258, card_w - 24, "Times-Bold", 24, COLORS["accent"], 26, "center")
        draw_wrapped(c, trunc(item.get("note", ""), 56), x + 12, 224, card_w - 24, "Helvetica", 8.6, COLORS["muted_dark"], 10, "center")
        x += card_w + 6

    draw_wrapped(c, copy["score_share"], MARGIN_X, 150, CONTENT_W, "Helvetica", 9, COLORS["accent"], 12, "center")


def draw_how_we_read_brands(c, report, total_pages):
    draw_page_shell(c, 2, total_pages, dark=False)
    draw_page_label(c, "HOW WE READ BRANDS", "Most brand audits give you a checklist. We give you a verdict.", dark=False)

    intro = (
        "Every brand is telling a story whether it means to or not. The colours, the words, the offer, the website "
        "— all of it is sending a signal to your buyer before you have said a single word. The question is not whether "
        "your brand is communicating. It is whether what it is communicating is working.\n\n"
        "That is what BrandMirror reads. We analyse your brand the way a sharp-eyed audience watches a film in the "
        "first ten minutes — before the plot thickens, before they have decided to stay. Because that is exactly what "
        "your buyer is doing.\n\n"
        "We reverse-engineer that decision."
    )
    draw_wrapped(c, intro, MARGIN_X, 632, 244, "Helvetica", 11.2, COLORS["muted_light"], 16)

    c.setFillColor(COLORS["paper_soft"])
    c.roundRect(324, 448, 215, 184, 16, stroke=0, fill=1)
    draw_wrapped(c, "What We Look At", 344, 606, 170, "Times-Bold", 19, COLORS["ink"], 22)
    metrics = [
        "Positioning Clarity — does your buyer know what you are?",
        "Offer Specificity — can someone repeat what you sell without your help?",
        "Visual Credibility — does the way you look match the price you ask?",
        "AI Discoverability — can AI tools find, understand, and recommend your brand?",
        "Conversion Readiness — when someone is ready, is there a door to walk through?",
    ]
    yy = 574
    for item in metrics:
        yy = draw_wrapped(c, f"- {item}", 344, yy, 170, "Helvetica", 9.4, COLORS["muted_light"], 12.5) - 4

    c.setFillColor(COLORS["paper_soft"])
    c.roundRect(MARGIN_X, 286, CONTENT_W, 108, 16, stroke=0, fill=1)
    genre = report.get("genre", "")
    genre_block = (
        f"Every brand has a genre — the narrative logic your audience uses to make sense of you. "
        f"{report.get('brandName','This brand')} operates as {genre}. When a brand is in the wrong genre for its audience, "
        "the signal goes off before the buyer can name why."
    )
    draw_wrapped(c, "The Genre", MARGIN_X + 18, 368, 160, "Times-Bold", 18, COLORS["ink"], 21)
    draw_wrapped(c, genre_block, MARGIN_X + 18, 338, CONTENT_W - 36, "Helvetica", 10.2, COLORS["muted_light"], 14)

    close = (
        "A score. A genre. A Priority Fix Stack. A 30-day action plan. And one clear answer — what to fix first.\n\n"
        "Some people frame it. Most people fix it first."
    )
    draw_wrapped(c, close, MARGIN_X, 228, CONTENT_W, "Times-Italic", 15.5, COLORS["ink"], 19, "center")
    draw_wrapped(c, "Let’s run the Mirror.", MARGIN_X, 136, CONTENT_W, "Times-Bold", 20, COLORS["accent"], 24, "center")


def draw_final_poster(c, report, copy, report_id):
    poster = poster_source_for(report) or website_surface_source_for(report)
    c.setFillColor(HexColor("#0D0D0D"))
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    if poster:
        draw_image_cover(c, poster, 0, 0, PAGE_W, PAGE_H)
    genre = report.get("genre", "")
    poster_title = report.get("title") or report.get("brandName", "Brand")
    tagline = report.get("tagline", "")
    score = int(report.get("posterScore", 0))
    score_band = report.get("scoreBand", "")
    modifier = trunc(report.get("scoreModifier", ""), 118)

    draw_centered_tracked(c, genre.upper(), PAGE_W / 2, PAGE_H - 72, "Helvetica", 10.5, COLORS["accent"], 2.1)
    title_bottom = draw_title_card(c, poster_title, PAGE_W / 2, 614, PAGE_W - 120, COLORS["text"])
    draw_wrapped(c, tagline, 88, title_bottom - 6, PAGE_W - 176, "Times-Italic", 17.2, HexColor("#D9D9D9"), 20.5, "center")

    c.setStrokeColor(HexColor("#3A3A3A"))
    c.setLineWidth(1)
    c.line(108, 296, PAGE_W - 108, 296)
    c.line(108, 176, PAGE_W - 108, 176)

    draw_centered_tracked(c, f"BRAND MIRROR SCORE  {score}/100", PAGE_W / 2, 268, "Helvetica", 11.6, COLORS["text"], 1.2)
    draw_centered_tracked(c, score_band.upper(), PAGE_W / 2, 240, "Helvetica", 10.2, COLORS["accent"], 1.8)
    draw_wrapped(c, modifier, 116, 210, PAGE_W - 232, "Times-Italic", 12.2, HexColor("#A5ACB8"), 15.2, "center")

    draw_wrapped(c, f"Production File: {report_id}", MARGIN_X, 94, CONTENT_W, "Helvetica", 9.4, HexColor("#727986"), 12, "center")
    draw_wrapped(c, "A BrandMirror Analysis", MARGIN_X, 74, CONTENT_W, "Helvetica", 9.4, HexColor("#727986"), 12, "center")
    draw_wrapped(c, "Powered by Sahar", MARGIN_X, 54, CONTENT_W, "Helvetica", 9.4, HexColor("#727986"), 12, "center")


def render(payload):
    report = payload.get("report", payload)
    if isinstance(report, dict) and "report" in report and isinstance(report["report"], dict):
        report = report["report"]
    report = improve_report_copy(report)
    language = payload.get("language", "en")
    copy = COPY.get(language, COPY["en"])
    total_pages = 16

    genre = report.get("genre") or GENRE_BY_ARCHETYPE.get(report.get("visualWorld"), "")
    report["genre"] = genre
    report.setdefault("posterScore", round(sum(int(i.get("score", 0)) for i in report.get("scorecard", [])[:3]) / max(1, len(report.get("scorecard", [])[:3]))))
    report.setdefault("scoreBand", "Strong Premise, Needs a Better Edit")
    report.setdefault("scoreModifier", "The visual standard is strong. The commercial story still makes the buyer work too hard.")

    brand_code = "".join(ch for ch in report.get("brandName", "BRAND").upper() if ch.isalnum())[:3] or "BM"
    report_id = f"BM-{brand_code}-2026-001"

    buff = io.BytesIO()
    c = canvas.Canvas(buff, pagesize=A4)

    draw_cover(c, report, copy, report_id)
    c.showPage()

    draw_how_we_read_brands(c, report, total_pages)
    c.showPage()

    draw_page_shell(c, 3, total_pages, dark=False)
    draw_page_label(c, "FIRST READ", "What the company does, what it signals, and how it first reads", dark=False)
    top = 638
    intro_paragraphs = [
        norm(str(report.get("whatItDoes", ""))),
        norm(str(report.get("snapshot", ""))),
        norm(str(report.get("whatItSignals", ""))),
    ]
    left_width = 266
    for paragraph in [p for p in intro_paragraphs if p]:
        fitted_text, fitted_size, fitted_leading = fit_text_to_box(paragraph, "Helvetica", 12.8, left_width, 110, min_size=11.2)
        top = draw_wrapped(c, fitted_text, MARGIN_X, top, left_width, "Helvetica", fitted_size, COLORS["muted_light"], fitted_leading) - 18
    c.setFillColor(COLORS["paper_soft"])
    c.roundRect(368, 392, 171, 258, 16, stroke=0, fill=1)
    c.setFillColor(COLORS["accent"])
    c.setFont("Helvetica", 9)
    c.drawString(386, 626, copy["report_snapshot"])
    c.setFillColor(COLORS["ink"])
    c.setFont("Times-Bold", 24)
    c.drawString(386, 592, f"{report.get('posterScore', 0)}/100")
    draw_wrapped(c, copy["overall_readiness"], 386, 566, 125, "Helvetica", 10.5, COLORS["muted_light"], 13)
    draw_wrapped(c, report.get("title", ""), 386, 522, 125, "Times-Bold", 14.5, COLORS["ink"], 16)
    card_snapshot, card_size, card_leading = fit_text_to_box(first_sentence(report.get("snapshot", "")), "Helvetica", 10.3, 125, 78, min_size=9.4)
    draw_wrapped(c, card_snapshot, 386, 452, 125, "Helvetica", card_size, COLORS["muted_light"], card_leading)
    c.showPage()

    draw_score_dashboard(c, report, copy, total_pages)
    c.showPage()

    draw_page_shell(c, 5, total_pages, dark=False)
    draw_page_label(c, copy["method_label"], copy["method_title"], dark=False)
    bullets = [
        "Positioning Clarity measures how quickly the homepage makes the offer legible.",
        "AI Discoverability measures whether AI tools (ChatGPT, Gemini, Perplexity) can find, summarize, and recommend the brand accurately.",
        "Visual Credibility measures whether the design signals quality and control.",
        "Offer Specificity measures how directly the page explains what it does and why it matters.",
        "Conversion Readiness measures whether the page has earned a confident next step.",
    ]
    y = 650
    for bullet in bullets:
        y = draw_wrapped(c, f"- {bullet}", MARGIN_X, y, 272, "Helvetica", 11, COLORS["ink"], 17) - 8
    c.setFillColor(COLORS["paper_soft"])
    c.roundRect(360, 240, 179, 426, 14, stroke=0, fill=1)
    scales = [
        ("0-30", "Flatlining. The signal is broken or absent."),
        ("30-50", "Fragile. Foundation exists but does not hold trust."),
        ("50-70", "Unstable. Works in bursts, then loses the buyer."),
        ("70-85", "Stable. Signal holds, room to push harder."),
        ("85-100", "Leading. Page converts before copy has to explain."),
    ]
    yy = 630
    for title, body in scales:
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica-Bold", 12)
        c.drawString(378, yy, title)
        yy = draw_wrapped(c, body, 378, yy - 16, 140, "Helvetica", 9.5, COLORS["muted_light"], 13) - 12
    c.showPage()

    # --- Page 6: Signal Read Part 1 (diagnosis) ---
    draw_page_shell(c, 6, total_pages, dark=False)
    draw_page_label(c, "SIGNAL READ", "What is missing, where it drifts, and what the AI sees", dark=False)
    cards_p1 = [
        ("WHAT IS MISSING", report.get("whatIsMissing", "")),
        ("MIXED SIGNALS", report.get("mixedSignals", "")),
        ("AI DISCOVERABILITY", report.get("toneCheck", "")),
    ]
    card_w = (CONTENT_W - 18) / 2
    for index, (label, body) in enumerate(cards_p1):
        col = index % 2
        row = index // 2
        x = MARGIN_X + col * (card_w + 18)
        y = 616 - row * 220
        card_h = 180
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(x, y - card_h + 18, card_w, card_h, 14, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica", 8.5)
        c.drawString(x + 18, y - 12, label)
        body_text, body_size, body_leading = fit_text_to_box(body, "Helvetica", 11, card_w - 36, 120, min_size=9.8)
        draw_wrapped(c, body_text, x + 18, y - 38, card_w - 36, "Helvetica", body_size, COLORS["muted_light"], body_leading)
    c.showPage()

    # --- Page 7: Signal Read Part 2 (action) ---
    draw_page_shell(c, 7, total_pages, dark=False)
    draw_page_label(c, "SIGNAL READ", "What to do next, what to amplify, and what to drop", dark=False)
    cards_p2 = [
        ("WHAT TO DO NEXT", report.get("whatToDoNext", "")),
        ("WHAT TO AMPLIFY", report.get("whatToAmplify", "")),
        ("WHAT TO DROP", report.get("whatToDrop", "")),
    ]
    for index, (label, body) in enumerate(cards_p2):
        col = index % 2
        row = index // 2
        x = MARGIN_X + col * (card_w + 18)
        y = 616 - row * 220
        card_h = 180
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(x, y - card_h + 18, card_w, card_h, 14, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica", 8.5)
        c.drawString(x + 18, y - 12, label)
        body_text, body_size, body_leading = fit_text_to_box(body, "Helvetica", 11, card_w - 36, 120, min_size=9.8)
        draw_wrapped(c, body_text, x + 18, y - 38, card_w - 36, "Helvetica", body_size, COLORS["muted_light"], body_leading)
    c.showPage()

    website_surface = website_surface_source_for(report)
    draw_page_shell(c, 8, total_pages, dark=False)
    draw_page_label(c, copy["website_label"], copy["website_title"], dark=False)
    if website_surface:
        draw_image_cover(c, website_surface, MARGIN_X, 292, CONTENT_W, 308)
    callouts = report.get("screenshotCallouts", [])[:2]
    cx = MARGIN_X
    for item in callouts:
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(cx, 110, (CONTENT_W - 18) / 2, 142, 14, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica", 8.5)
        c.drawString(cx + 18, 230, item.get("zone", "").replace("-", " ").upper())
        draw_wrapped(c, item.get("title", ""), cx + 18, 204, 210, "Times-Bold", 18, COLORS["ink"], 20)
        draw_wrapped(c, trunc(item.get("body", ""), 170), cx + 18, 160, 210, "Helvetica", 10.5, COLORS["muted_light"], 14)
        cx += (CONTENT_W - 18) / 2 + 18
    c.showPage()

    # Practical fix suggestions per axis when score is below threshold
    AXIS_FIXES = {
        "Positioning Clarity": {
            "low": "Rewrite your hero headline to state exactly what you do, for whom, and why it matters — in one sentence. Remove abstract language.",
            "mid": "Move your strongest proof point (case study, metric, testimonial) above the fold so it is visible without scrolling.",
        },
        "AI Discoverability": {
            "low": "Add structured data (Schema.org markup), a clear meta description, and an FAQ section that mirrors how people ask AI assistants about your category.",
            "mid": "Create a dedicated 'About' or 'What We Do' page with natural-language descriptions that AI tools can parse and recommend accurately.",
        },
        "Visual Credibility": {
            "low": "Replace stock photos with custom imagery. Align your colour palette, typography, and spacing to match the price point you are asking for.",
            "mid": "Commission a professional brand shoot or illustration set. Ensure visual consistency across hero, about, and service pages.",
        },
        "Offer Specificity": {
            "low": "List your exact services or products with pricing (or pricing logic). Replace 'solutions' and 'services' with concrete deliverables the buyer can picture.",
            "mid": "Add a comparison table or 'Who This Is For' section that helps the buyer self-select. Make the transformation explicit.",
        },
        "Conversion Readiness": {
            "low": "Add a single, clear CTA above the fold. Remove competing CTAs. Add one piece of social proof (testimonial, client logo, or metric) within scroll distance of the button.",
            "mid": "Add urgency or specificity to your CTA (e.g. 'Book a 15-min call' instead of 'Get in touch'). Ensure the form or booking flow takes under 30 seconds.",
        },
    }

    axis_pages = [
        ("Positioning Clarity", report.get("positioningRead", ""), report.get("whatsBroken", [""])[0],
         report.get("whatIsMissing", "")),
        ("AI Discoverability", report.get("toneCheck", ""), report.get("audienceMismatch", [""])[0],
         report.get("mixedSignals", "")),
        ("Visual Credibility", report.get("visualIdentityRead", ""), report.get("whatWorks", [""])[0],
         report.get("whatToAmplify", "")),
        ("Offer Specificity", report.get("aboveTheFold", ""), report.get("headlineCorrection", {}).get("currentProblem", ""),
         report.get("whatToDoNext", "")),
        ("Conversion Readiness", report.get("conversionRead", ""), report.get("whyNotConverting", [""])[0],
         report.get("whatToDrop", "")),
    ]
    for idx, (title, body, quote, extra) in enumerate(axis_pages, start=9):
        draw_page_shell(c, idx, total_pages, dark=False)
        c.setFillColor(COLORS["dark"])
        c.rect(0, PAGE_H - 156, PAGE_W, 156, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN_X, PAGE_H - 78, title.upper())
        draw_wrapped(c, title, MARGIN_X, PAGE_H - 110, 320, "Times-Bold", 30, COLORS["text"], 32)

        # Main analysis — use body + extra for more meat
        combined_body = body
        if extra and extra != body:
            combined_body = f"{body}\n\n{extra}"
        fitted_body, bsz, blead = fit_text_to_box(combined_body, "Helvetica", 12, 250, 220, min_size=10.2)
        draw_wrapped(c, fitted_body, MARGIN_X, 600, 250, "Helvetica", bsz, COLORS["muted_light"], blead)

        # Right card — most revealing line
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(338, 424, 201, 154, 14, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.setFont("Helvetica", 9)
        c.drawString(358, 548, copy["axis_reveal"])
        draw_wrapped(c, first_sentence(quote), 358, 520, 161, "Times-Roman", 14, COLORS["ink"], 18)
        if title == "Visual Credibility" and website_surface:
            c.drawImage(website_surface, 358, 444, width=161, height=88, preserveAspectRatio=True, mask="auto")

        # Score bar
        score = 70
        for row in report.get("scorecard", []):
            if norm(row.get("label", "")).lower() == norm(title).lower():
                score = int(row.get("score", 70))
                break
        c.setFillColor(COLORS["ink"])
        c.setFont("Times-Bold", 16)
        c.drawString(MARGIN_X, 336, f"Current score · {score}/100")
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(MARGIN_X, 302, CONTENT_W, 8, 4, stroke=0, fill=1)
        c.setFillColor(COLORS["accent"])
        c.roundRect(MARGIN_X, 302, max(8, CONTENT_W * score / 100.0), 8, 4, stroke=0, fill=1)

        # Practical fix box — tailored to score level
        fixes = AXIS_FIXES.get(title, {})
        fix_text = fixes.get("low", "") if score < 60 else fixes.get("mid", "")
        if fix_text:
            c.setFillColor(COLORS["dark_soft"])
            c.roundRect(MARGIN_X, 148, CONTENT_W, 118, 14, stroke=0, fill=1)
            c.setFillColor(COLORS["terracotta"])
            c.setFont("Helvetica", 8.5)
            c.drawString(MARGIN_X + 18, 244, "PRACTICAL FIX" if score < 60 else "NEXT LEVEL MOVE")
            fix_fitted, fsz, flead = fit_text_to_box(fix_text, "Helvetica", 11, CONTENT_W - 36, 72, min_size=9.8)
            draw_wrapped(c, fix_fitted, MARGIN_X + 18, 222, CONTENT_W - 36, "Helvetica", fsz, COLORS["muted_light"], flead)
        c.showPage()

    # --- Page 14: Archetype + Poster (merged) ---
    draw_page_shell(c, 14, total_pages, dark=False)
    draw_page_label(c, copy["archetype_label"], f"{report.get('archetypeRead', {}).get('primary', '')} with {report.get('archetypeRead', {}).get('secondary', '')} pull", dark=False)

    # Left: rationale text
    left_w = 246
    right_x = MARGIN_X + left_w + 24
    right_w = PAGE_W - right_x - MARGIN_X
    draw_wrapped(c, trunc(report.get("archetypeRead", {}).get("rationale", ""), 280), MARGIN_X, 626, left_w, "Helvetica", 12.2, COLORS["muted_light"], 18)

    # Right: poster image (larger since this is the only poster page now)
    poster = poster_source_for(report)
    if poster:
        c.drawImage(poster, right_x, 372, width=right_w, height=260, preserveAspectRatio=True, mask="auto")

    # Genre + tagline
    genre = report.get("genre", "")
    tagline = report.get("tagline", "")
    c.setStrokeColor(COLORS["rule"])
    c.setLineWidth(0.8)
    c.line(MARGIN_X, 340, PAGE_W - MARGIN_X, 340)
    if genre:
        draw_centered_tracked(c, genre.upper(), PAGE_W / 2, 316, "Helvetica", 9, COLORS["accent"], 1.6)
    if tagline:
        draw_wrapped(c, tagline, MARGIN_X + 20, 292, CONTENT_W - 40, "Times-Italic", 15, COLORS["ink"], 18, "center")

    # Commercial implications
    draw_wrapped(c, "SO WHAT DOES THIS MEAN COMMERCIALLY?", MARGIN_X, 248, CONTENT_W, "Helvetica", 9, COLORS["accent"], 12)
    implications = report.get("expectationGap", [])[:3] or ["Buyers expect the value story to feel as deliberate as the visual system."]
    box_w = (CONTENT_W - 24) / 3
    for index, item in enumerate(implications):
        x = MARGIN_X + index * (box_w + 12)
        c.setFillColor(COLORS["paper_soft"])
        c.roundRect(x, 124, box_w, 94, 14, stroke=0, fill=1)
        draw_wrapped(c, item, x + 14, 196, box_w - 28, "Helvetica", 10, COLORS["muted_light"], 13)
    c.showPage()

    # --- Page 15: Priority Fix Stack ---
    draw_page_shell(c, 15, total_pages, dark=False)
    draw_page_label(c, copy["fix_label"], "What to fix now, what can wait, and what is already earning trust", dark=False)
    bands = [
        ("FIX NOW", report.get("priorityFixes", {}).get("fixNow", []), COLORS["terracotta"]),
        ("FIX NEXT", report.get("priorityFixes", {}).get("fixNext", []), COLORS["accent"]),
        ("KEEP", report.get("priorityFixes", {}).get("keep", []), COLORS["success"]),
    ]
    by = 560
    for title, items, col in bands:
        c.setFillColor(COLORS["dark_soft"])
        c.roundRect(MARGIN_X, by - 120, CONTENT_W, 110, 16, stroke=0, fill=1)
        c.setFillColor(col)
        c.roundRect(MARGIN_X, by - 120, 120, 110, 16, stroke=0, fill=1)
        c.setFillColor(COLORS["text"] if title != "KEEP" else COLORS["ink"])
        c.setFont("Helvetica", 12)
        c.drawString(MARGIN_X + 18, by - 44, title)
        yy = by - 32
        for item in items[:3]:
            yy = draw_wrapped(c, f"- {item}", MARGIN_X + 148, yy, 300, "Helvetica", 10.5, COLORS["text"], 14) - 6
        by -= 136

    # Practical solution box for weakest axes
    scorecard = report.get("scorecard", [])
    weak_axes = sorted(scorecard, key=lambda r: int(r.get("score", 100)))[:2]
    if weak_axes:
        c.setFillColor(COLORS["dark_soft"])
        c.roundRect(MARGIN_X, 92, CONTENT_W, 108, 14, stroke=0, fill=1)
        c.setFillColor(COLORS["terracotta"])
        c.setFont("Helvetica", 8.5)
        c.drawString(MARGIN_X + 18, 180, "WHERE TO START — BASED ON YOUR WEAKEST SIGNALS")
        sol_y = 160
        for axis_row in weak_axes:
            label = axis_row.get("label", "")
            sc = int(axis_row.get("score", 70))
            fix = AXIS_FIXES.get(label, {}).get("low" if sc < 60 else "mid", "")
            if fix:
                sol_y = draw_wrapped(c, f"{label} ({sc}): {fix}", MARGIN_X + 18, sol_y, CONTENT_W - 36, "Helvetica", 9.8, COLORS["muted_light"], 13) - 6
    c.showPage()

    # --- Page 16: 30-Day Action Plan + Back Cover ---
    draw_page_shell(c, 16, total_pages, dark=False)
    draw_page_label(c, copy["plan30"], "Your roadmap for the next 30 days", dark=False)
    left_w = 248
    right_x = 338
    right_w = PAGE_W - right_x - MARGIN_X

    # 30-day plan items
    yy = 638
    for item in report.get("actionPlan", {}).get("next30Days", [])[:5]:
        yy = draw_wrapped(c, f"- {item}", MARGIN_X, yy, left_w, "Helvetica", 11, COLORS["muted_light"], 16) - 10

    # Headline correction card
    c.setFillColor(COLORS["paper_soft"])
    c.roundRect(right_x, 414, right_w, 224, 14, stroke=0, fill=1)
    draw_wrapped(c, "Headline correction", right_x + 20, 612, right_w - 40, "Helvetica", 9, COLORS["accent"], 12)
    draw_wrapped(c, "AFTER", right_x + 20, 588, right_w - 40, "Helvetica", 8.4, COLORS["accent"], 10)
    draw_wrapped(c, report.get("rewriteSuggestions", {}).get("heroLine", ""), right_x + 20, 566, right_w - 40, "Times-Bold", 16, COLORS["ink"], 18)
    draw_wrapped(c, "SUPPORT", right_x + 20, 494, right_w - 40, "Helvetica", 8.4, COLORS["accent"], 10)
    draw_wrapped(c, report.get("rewriteSuggestions", {}).get("subheadline", ""), right_x + 20, 472, right_w - 40, "Helvetica", 10, COLORS["muted_light"], 13)
    draw_wrapped(c, "CTA", right_x + 20, 436, right_w - 40, "Helvetica", 8.4, COLORS["accent"], 10)
    draw_wrapped(c, report.get("rewriteSuggestions", {}).get("cta", ""), right_x + 20, 418, right_w - 40, "Helvetica", 10, COLORS["terracotta"], 13)

    # What comes next
    draw_wrapped(c, copy["next_label"], MARGIN_X, 362, CONTENT_W, "Helvetica", 9, COLORS["accent"], 12)
    next_options = [
        "Do it yourself — use the fix stack and action plan as your roadmap.",
        "BrandMirror Reviewed — guided walkthrough of the diagnosis and next moves.",
        "Work with Sahar — turn the diagnosis into a full brand and website rebuild.",
    ]
    yy = 336
    for card in next_options:
        yy = draw_wrapped(c, f"- {card}", MARGIN_X, yy, CONTENT_W, "Helvetica", 10.4, COLORS["muted_light"], 14) - 8

    # Back cover footer
    c.setStrokeColor(COLORS["rule"])
    c.setLineWidth(1)
    c.line(MARGIN_X, 160, PAGE_W - MARGIN_X, 160)
    draw_wrapped(c, copy["back_cover"], MARGIN_X, 132, CONTENT_W, "Times-Italic", 16, COLORS["ink"], 20, "center")
    draw_wrapped(c, "brandmirror.app", MARGIN_X, 78, CONTENT_W, "Helvetica", 11, COLORS["accent"], 14, "center")
    draw_wrapped(c, copy["powered"], MARGIN_X, 52, CONTENT_W, "Helvetica", 9, COLORS["muted_dark"], 12, "center")
    c.showPage()
    c.save()
    return buff.getvalue()


def main():
    payload = json.loads(sys.stdin.read())
    sys.stdout.buffer.write(render(payload))


if __name__ == "__main__":
    main()
