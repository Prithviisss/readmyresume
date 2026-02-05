from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

templates = [
    {
        "name": "modern-minimal.pdf",
        "title": "Modern Minimal Resume",
        "desc": "Clean and contemporary design with excellent ATS compatibility"
    },
    {
        "name": "professional-classic.pdf",
        "title": "Professional Classic Resume",
        "desc": "Traditional and formal layout, perfect for corporate roles"
    },
    {
        "name": "creative-bold.pdf",
        "title": "Creative Bold Resume",
        "desc": "Eye-catching design for creative and design-focused roles"
    },
    {
        "name": "tech-focus.pdf",
        "title": "Tech Focus Resume",
        "desc": "Optimized for tech professionals with skills showcase"
    },
    {
        "name": "executive-premium.pdf",
        "title": "Executive Premium Resume",
        "desc": "High-end design for senior and executive positions"
    }
]

def create_resume_template(filename, title, description):
    path = f"public/templates/{filename}"
    doc = SimpleDocTemplate(path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        leading=14,
        spaceAfter=6
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderColor=colors.HexColor('#3b82f6'),
        borderWidth=2,
        borderPadding=4
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Contact Info
    elements.append(Paragraph("john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe | New York, NY", subtitle_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Professional Summary
    elements.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
    elements.append(Paragraph(
        "Results-driven professional with 5+ years of experience in [Your Field]. "
        "Proven track record of delivering high-quality results and leading successful projects. "
        "Skilled in problem-solving, team collaboration, and strategic planning.",
        normal_style
    ))
    elements.append(Spacer(1, 0.15*inch))
    
    # Experience
    elements.append(Paragraph("PROFESSIONAL EXPERIENCE", section_style))
    elements.append(Paragraph("<b>Senior Position | Company Name | Jan 2021 - Present</b>", normal_style))
    elements.append(Paragraph("• Achieved 30% improvement in operational efficiency through process optimization", normal_style))
    elements.append(Paragraph("• Led cross-functional teams to deliver projects on time and within budget", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    
    elements.append(Paragraph("<b>Mid-Level Position | Previous Company | Jun 2018 - Dec 2020</b>", normal_style))
    elements.append(Paragraph("• Managed key accounts and increased client satisfaction by 25%", normal_style))
    elements.append(Paragraph("• Developed and implemented new strategies that increased revenue", normal_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Skills
    elements.append(Paragraph("SKILLS", section_style))
    elements.append(Paragraph(
        "<b>Technical:</b> Problem-solving, Data Analysis, Project Management, Communication<br/>"
        "<b>Leadership:</b> Team Leadership, Strategic Planning, Decision Making<br/>"
        "<b>Languages:</b> English, [Other Language]",
        normal_style
    ))
    elements.append(Spacer(1, 0.15*inch))
    
    # Education
    elements.append(Paragraph("EDUCATION", section_style))
    elements.append(Paragraph("<b>Bachelor of Science in [Field] | University Name | Graduated: 2018</b>", normal_style))
    elements.append(Paragraph("GPA: 3.8/4.0", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Footer
    elements.append(Spacer(1, 0.2*inch))
    footer = Paragraph(f"<i>Template: {description}</i>", subtitle_style)
    elements.append(footer)
    
    doc.build(elements)
    print(f"✅ Created {filename}")

# Generate all templates
for template in templates:
    create_resume_template(template["name"], template["title"], template["desc"])

print("\n✨ All PDF templates created successfully!")
