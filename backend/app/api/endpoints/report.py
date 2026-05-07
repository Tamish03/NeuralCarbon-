from fastapi import APIRouter, BackgroundTasks, Response
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

router = APIRouter()

class EsgReportRequest(BaseModel):
    company_name: str = "NeuralCarbon Facility"
    report_period: str = "Q3 2026"
    total_emissions_kg: float
    emissions_reduced_kg: float
    carbon_credits_earned: float
    risk_level: str

@router.post("/esg")
def generate_esg_report(req: EsgReportRequest):
    """
    Auto-generates a mock ESG Compliance Report PDF based on platform metrics.
    Returns the raw PDF bytes.
    """
    buffer = io.BytesIO()
    
    # Create the PDF object, using the buffer as its "file."
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Styling and Content
    p.setFont("Helvetica-Bold", 24)
    p.setFillColor(HexColor("#22c55e")) # Green
    p.drawString(50, height - 80, "NeuralCarbon ESG Compliance Report")
    
    p.setFont("Helvetica", 12)
    p.setFillColor(HexColor("#000000"))
    p.drawString(50, height - 120, f"Facility: {req.company_name}")
    p.drawString(50, height - 140, f"Period: {req.report_period}")
    p.drawString(50, height - 160, f"Generated At: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 200, "1. Executive Summary")
    
    p.setFont("Helvetica", 12)
    summary_text = (
        f"During {req.report_period}, {req.company_name} emitted {req.total_emissions_kg:,.2f} kg of CO2. "
        f"Through autonomous ML prescriptions, {req.emissions_reduced_kg:,.2f} kg of CO2 "
        f"were prevented, yielding {req.carbon_credits_earned:,.2f} verifiable carbon credits."
    )
    # simple text wrap
    p.drawString(50, height - 230, summary_text)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 280, "2. Operational Metrics")
    
    p.setFont("Helvetica", 12)
    p.drawString(70, height - 310, f"Total Measured Emissions: {req.total_emissions_kg:,.2f} kg")
    p.drawString(70, height - 330, f"Total Avoided Emissions: {req.emissions_reduced_kg:,.2f} kg")
    p.drawString(70, height - 350, f"Current Risk Level: {req.risk_level}")
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 400, "3. Certification")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 430, "This report is generated automatically via NeuralCarbon platform algorithms.")
    p.drawString(50, height - 450, "Data is backed by cryptographic timestamping (Phase 6 Roadmap).")

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()

    # FileResponse requires a file on disk, StreamingResponse can use a buffer,
    # but simplest is returning bytes with proper headers
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=esg_report_{req.report_period.replace(' ', '_')}.pdf"
        }
    )
