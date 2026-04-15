from django.core.mail import EmailMultiAlternatives, get_connection

from .models import EmailSetting


def send_dynamic_email(subject: str, body: str, to: list[str], html_body: str | None = None) -> bool:
    cfg = EmailSetting.load()
    if not cfg.enabled or not cfg.host:
        return False
    conn = get_connection(
        host=cfg.host,
        port=cfg.port,
        username=cfg.username or None,
        password=cfg.password or None,
        use_tls=cfg.use_tls,
    )
    msg = EmailMultiAlternatives(
        subject=subject,
        body=body,
        from_email=cfg.from_email or cfg.username,
        to=to,
        connection=conn,
    )
    if html_body:
        msg.attach_alternative(html_body, "text/html")
    try:
        msg.send()
        return True
    except Exception:
        return False
