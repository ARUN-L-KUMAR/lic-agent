"""
Branded HTML layout shared by every transactional email.

Table-based markup with inline styles so it renders consistently in Gmail, Outlook and
mobile clients. The LIC logo is embedded as an inline attachment (cid:lic-logo) so it shows
without the recipient having to "load remote images".
"""
from dataclasses import dataclass
from html import escape
from pathlib import Path
from typing import Optional, Sequence

from app.core.config import settings

LOGO_CID = "lic-logo"
LOGO_PATH = Path(__file__).resolve().parent.parent / "assets" / "logo.jpg"

NAVY = "#004B87"
NAVY_DARK = "#003D70"
YELLOW = "#FFCC00"
TEXT = "#172033"
MUTED = "#667085"
BG = "#F2F5F9"
BORDER = "#E3E8EF"


def load_logo() -> Optional[bytes]:
    try:
        return LOGO_PATH.read_bytes()
    except OSError:
        return None


@dataclass
class Button:
    label: str
    href: str
    primary: bool = True


def _button(b: Button) -> str:
    if b.primary:
        style = f"background:{YELLOW};color:{TEXT};border:2px solid {YELLOW};"
    else:
        style = f"background:#ffffff;color:{NAVY};border:2px solid {NAVY};"
    return (
        f'<a href="{escape(b.href, quote=True)}" target="_blank" '
        f'style="{style}display:inline-block;padding:11px 22px;border-radius:8px;'
        f'font-size:14px;font-weight:700;text-decoration:none;margin:0 6px 10px 0;">{escape(b.label)}</a>'
    )


def render_email(
    *,
    heading: str,
    intro: str,
    preheader: str = "",
    badge: Optional[str] = None,
    rows: Optional[Sequence[tuple[str, str, Optional[str]]]] = None,
    buttons: Optional[Sequence[Button]] = None,
    note: Optional[str] = None,
    link_fallback: Optional[str] = None,
) -> str:
    """
    heading / intro: trusted HTML-safe text (callers escape user input).
    rows: (label, value, optional href) - value is escaped here.
    """
    agent_name = f"{settings.AGENT_FIRST_NAME} {settings.AGENT_LAST_NAME}".strip()

    badge_html = (
        f'<span style="display:inline-block;background:#FFF3B8;color:#7a5d00;font-size:11px;font-weight:700;'
        f'letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:20px;">{escape(badge)}</span>'
        if badge
        else ""
    )

    rows_html = ""
    if rows:
        body = ""
        for i, (label, value, href) in enumerate(rows):
            border = f"border-top:1px solid {BORDER};" if i else ""
            val = escape(value)
            if href:
                val = f'<a href="{escape(href, quote=True)}" style="color:{NAVY};text-decoration:none;font-weight:600;">{val}</a>'
            else:
                val = f'<span style="color:{TEXT};font-weight:600;">{val}</span>'
            body += (
                f'<tr><td style="padding:13px 18px;{border}color:{MUTED};font-size:13px;width:120px;vertical-align:top;">'
                f"{escape(label)}</td>"
                f'<td style="padding:13px 18px;{border}font-size:15px;">{val}</td></tr>'
            )
        rows_html = (
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            f'style="background:{BG};border:1px solid {BORDER};border-radius:10px;margin:22px 0 8px;">{body}</table>'
        )

    buttons_html = (
        f'<div style="margin-top:22px;">{"".join(_button(b) for b in buttons)}</div>' if buttons else ""
    )

    fallback_html = (
        f'<p style="margin:18px 0 0;color:{MUTED};font-size:12px;line-height:1.6;">'
        f"Button not working? Copy and paste this link into your browser:<br>"
        f'<a href="{escape(link_fallback, quote=True)}" style="color:{NAVY};word-break:break-all;">{escape(link_fallback)}</a></p>'
        if link_fallback
        else ""
    )

    note_html = (
        f'<p style="margin:22px 0 0;padding-top:16px;border-top:1px solid {BORDER};color:{MUTED};font-size:12.5px;line-height:1.6;">{note}</p>'
        if note
        else ""
    )

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(heading)}</title>
</head>
<body style="margin:0;padding:0;background:{BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{BG};">{escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BG};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0"
         style="width:100%;max-width:600px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

    <!-- Header -->
    <tr><td style="background:{NAVY_DARK};background-image:linear-gradient(135deg,{NAVY_DARK},{NAVY});border-radius:14px 14px 0 0;padding:22px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;width:1%;white-space:nowrap;">
          <span style="display:inline-block;background:#ffffff;border-radius:8px;padding:6px 8px;line-height:0;">
            <img src="cid:{LOGO_CID}" alt="LIC" width="104" style="display:block;border:0;width:104px;height:auto;">
          </span>
        </td>
        <td style="vertical-align:middle;padding-left:16px;">
          <div style="color:#ffffff;font-size:16px;font-weight:700;line-height:1.3;">{escape(agent_name)}</div>
          <div style="color:{YELLOW};font-size:12px;font-weight:600;letter-spacing:.5px;margin-top:2px;">LIC AGENT</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="background:{YELLOW};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:32px 28px 26px;border-left:1px solid {BORDER};border-right:1px solid {BORDER};">
      {badge_html}
      <h1 style="margin:{14 if badge else 0}px 0 10px;color:{TEXT};font-size:23px;line-height:1.3;font-weight:800;">{heading}</h1>
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">{intro}</p>
      {rows_html}
      {buttons_html}
      {fallback_html}
      {note_html}
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#ffffff;border:1px solid {BORDER};border-top:none;border-radius:0 0 14px 14px;padding:0 28px 26px;">
      <div style="background:{BG};border-radius:10px;padding:14px 16px;color:{MUTED};font-size:11.5px;line-height:1.6;">
        This email was sent by {escape(agent_name)}, LIC Agent. This is an independent agent website and is
        <strong>not</strong> the official LIC of India website. Policy details are subject to official LIC documents.
      </div>
    </td></tr>
    <tr><td align="center" style="padding:16px 8px 0;color:#98A2B3;font-size:11px;">
      &copy; {escape(agent_name)} &middot; LIC Agent
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>"""
