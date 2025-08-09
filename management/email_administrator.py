#!/usr/local/lib/mailinabox/env/bin/python

# Reads in STDIN. If the stream is not empty, mail it to the system administrator.

import sys
import re
import html
import smtplib
import datetime

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# In Python 3.6:
#from email.message import Message

from utils import load_environment

def create_enhanced_html_email(content, subject, env):
    """Create a beautifully styled HTML email based on the subject and content."""
    
    # Determine the email type based on subject
    email_type = "general"
    if "mail" in subject.lower() or "usage" in subject.lower():
        email_type = "mail"
    elif "backup" in subject.lower():
        email_type = "backup"
    elif "ssl" in subject.lower() or "certificate" in subject.lower():
        email_type = "ssl"
    elif "status" in subject.lower() or "check" in subject.lower():
        email_type = "status"
    
    # Color schemes for different report types
    color_schemes = {
        "mail": {"primary": "#3B82F6", "secondary": "#EFF6FF", "accent": "#1D4ED8"},
        "backup": {"primary": "#10B981", "secondary": "#ECFDF5", "accent": "#047857"},
        "ssl": {"primary": "#F59E0B", "secondary": "#FFFBEB", "accent": "#D97706"},
        "status": {"primary": "#8B5CF6", "secondary": "#F3F4F6", "accent": "#7C3AED"},
        "general": {"primary": "#6366F1", "secondary": "#EEF2FF", "accent": "#4F46E5"}
    }
    
    colors = color_schemes.get(email_type, color_schemes["general"])
    
    # Icon mapping
    icons = {
        "mail": "📧",
        "backup": "💾", 
        "ssl": "🔒",
        "status": "⚙️",
        "general": "📋"
    }
    
    icon = icons.get(email_type, icons["general"])
    
    # Parse content for specific patterns and enhance them
    enhanced_content = enhance_content_formatting(content, email_type)
    
    # Current timestamp
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }}
        .header {{
            background: linear-gradient(135deg, {colors['primary']} 0%, {colors['accent']} 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }}
        .header .subtitle {{
            font-size: 16px;
            opacity: 0.9;
        }}
        .content {{
            padding: 40px;
        }}
        .report-meta {{
            background: {colors['secondary']};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid {colors['primary']};
        }}
        .meta-row {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }}
        .meta-row:last-child {{ margin-bottom: 0; }}
        .meta-label {{
            font-weight: 600;
            color: #4B5563;
        }}
        .meta-value {{
            color: #6B7280;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
        }}
        .report-content {{
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e5e7eb;
        }}
        .status-indicator {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }}
        .status-success {{
            background: #ECFDF5;
            color: #047857;
            border: 1px solid #A7F3D0;
        }}
        .status-warning {{
            background: #FFFBEB;
            color: #D97706;
            border: 1px solid #FDE68A;
        }}
        .status-error {{
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
        }}
        .footer {{
            background: #f8fafc;
            padding: 20px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6B7280;
            font-size: 14px;
        }}
        .footer a {{
            color: {colors['primary']};
            text-decoration: none;
        }}
        pre {{
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #374151;
        }}
        .highlight {{
            background: #fef3c7;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: 600;
        }}
        .error-text {{
            color: #DC2626;
            font-weight: 600;
        }}
        .warning-text {{
            color: #D97706;
            font-weight: 600;
        }}
        .success-text {{
            color: #047857;
            font-weight: 600;
        }}
        @media (max-width: 640px) {{
            .container {{ margin: 10px; }}
            .header, .content, .footer {{ padding: 20px; }}
            .meta-row {{ flex-direction: column; align-items: flex-start; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{icon} {subject}</h1>
            <div class="subtitle">Mailosaurus Mail Server Report</div>
        </div>
        
        <div class="content">
            <div class="report-meta">
                <div class="meta-row">
                    <span class="meta-label">Server:</span>
                    <span class="meta-value">{env['PRIMARY_HOSTNAME']}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Generated:</span>
                    <span class="meta-value">{current_time}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Report Type:</span>
                    <span class="meta-value">{email_type.title()}</span>
                </div>
            </div>
            
            <div class="report-content">
                <pre>{enhanced_content}</pre>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated report from your Mailosaurus mail server.</p>
            <p>Powered by <a href="#">Mail-in-a-Box</a> • <a href="#{env['PRIMARY_HOSTNAME']}/admin/">Admin Panel</a></p>
        </div>
    </div>
</body>
</html>
"""
    
    return html_template

def enhance_content_formatting(content, email_type):
    """Enhance content formatting based on email type."""
    
    # Escape HTML first
    content = html.escape(content)
    
    # Add styling for common patterns
    
    # Status indicators
    content = re.sub(r'(✓|OK|SUCCESS|PASSED)', r'<span class="success-text">\1</span>', content, flags=re.IGNORECASE)
    content = re.sub(r'(✖|ERROR|FAILED|CRITICAL)', r'<span class="error-text">\1</span>', content, flags=re.IGNORECASE)
    content = re.sub(r'(\?|WARNING|WARN)', r'<span class="warning-text">\1</span>', content, flags=re.IGNORECASE)
    
    # Highlight numbers and statistics
    content = re.sub(r'\b(\d+)\s+(emails?|messages?|users?|certificates?|GB|MB|KB)\b', r'<span class="highlight">\1 \2</span>', content, flags=re.IGNORECASE)
    
    # Highlight important lines that start with specific words
    content = re.sub(r'^(Sent email|Received email|User logins|Backup|SSL|System|Error:|Warning:)(.*)$', r'<strong>\1</strong>\2', content, flags=re.MULTILINE)
    
    # Email addresses
    content = re.sub(r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b', r'<span class="highlight">\1</span>', content)
    
    # Dates and times
    content = re.sub(r'\b(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\b', r'<span class="highlight">\1</span>', content)
    
    return content

# Load system environment info.
env = load_environment()

# Process command line args.
subject = sys.argv[1]

# Administrator's email address.
admin_addr = "administrator@" + env['PRIMARY_HOSTNAME']

# Read in STDIN.
content = sys.stdin.read().strip()

# If there's nothing coming in, just exit.
if content == "":
    sys.exit(0)

# create MIME message
msg = MIMEMultipart('alternative')

# In Python 3.6:
#msg = Message()

msg['From'] = '"{}" <{}>'.format(env['PRIMARY_HOSTNAME'], admin_addr)
msg['To'] = admin_addr
msg['Subject'] = "[{}] {}".format(env['PRIMARY_HOSTNAME'], subject)

# Create enhanced HTML content
content_html = create_enhanced_html_email(content, subject, env)

msg.attach(MIMEText(content, 'plain'))
msg.attach(MIMEText(content_html, 'html'))

# In Python 3.6:
#msg.set_content(content)
#msg.add_alternative(content_html, "html")

# send
smtpclient = smtplib.SMTP('127.0.0.1', 25)
smtpclient.ehlo()
smtpclient.sendmail(
        admin_addr, # MAIL FROM
        admin_addr, # RCPT TO
        msg.as_string())
smtpclient.quit()
