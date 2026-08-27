"""
NormAI Database Seeding Script.
Reads metadata structures from frontend definition schemas and initializes local PostgreSQL tables.
Idempotent and safe to run multiple times.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole, Standard, StandardClause, StandardRelationship,
    StandardAmendment, StandardTimeline, Laboratory, Licence, RelationshipType
)
import bcrypt
import uuid
import datetime

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')


def seed_database():
    print("Connecting to database and creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. User Seeding
        print("Seeding users...")
        demo_user = db.query(User).filter(User.email == "demo@normai.in").first()
        if not demo_user:
            demo_user = User(
                id=str(uuid.uuid4()),
                full_name="SIH Auditor / DPIIT MSME Compliance",
                email="demo@normai.in",
                password_hash=hash_password("password"),
                role=UserRole.USER,
                preferred_language="en",
                is_active=True,
                created_at=datetime.datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            print("Demo user created.")
        else:
            print("Demo user already exists.")

        # 2. Standards Seeding
        print("Seeding Standards & Clauses...")
        
        # Helper standard addition
        def add_standard(code, title, full_title, scope, category, qco_details, scheme, is_mandatory, match_score, why_matched, why_not_applied, applicable, status="ACTIVE", amendments=0, last_verified="Today (BIS Gazette Sync)"):
            std = db.query(Standard).filter(Standard.standard_code == code).first()
            if not std:
                std = Standard(
                    id=str(uuid.uuid4()),
                    standard_code=code,
                    title=title,
                    full_title=full_title,
                    scope=scope,
                    category=category,
                    qco_details=qco_details,
                    scheme=scheme,
                    mandatory_status="MANDATORY (QCO)" if is_mandatory else "VOLUNTARY",
                    match_score=match_score,
                    why_matched=why_matched,
                    why_not_applied=why_not_applied,
                    applicable_products=applicable,
                    status=status,
                    amendments_count=amendments,
                    last_verified=last_verified,
                    is_demo=True
                )
                db.add(std)
                db.commit()
                print(f"Standard {code} added.")
            return std

        # IS 302-2-14
        is302_2_14 = add_standard(
            code="IS 302-2-14",
            title="Particular Requirements for Kitchen Machines",
            full_title="Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements, Section 14: Kitchen Machines",
            scope="This standard deals with the safety of electric kitchen machines for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances.",
            category="Household Electrical & Consumer Electronics",
            qco_details="Electrical Appliances (Quality Control) Order, 2023 under Section 16 of BIS Act, 2016.",
            scheme="Scheme I (ISI Mark)",
            is_mandatory=True,
            match_score=96,
            why_matched=[
                "Electric motor-driven mechanism",
                "Domestic / household food processing application",
                "Operating voltage nominal 230V AC, 50Hz single phase",
                "Rated input up to 1000W with detachable grinding / blending vessels"
            ],
            why_not_applied="Does not apply to industrial food preparation machines intended for continuous commercial catering (which fall under IS 9849).",
            applicable=[
                "Mixer Grinders & Blenders",
                "Food Processors",
                "Juicers & Citrus Presses",
                "Coffee Grinders & Wet Grinders",
                "Hand Blenders & Dough Kneaders"
            ],
            amendments=2
        )

        # Base General standard IS 302-1
        is302_1 = add_standard(
            code="IS 302-1",
            title="Safety of Household Electrical Appliances — Part 1: General Requirements",
            full_title="Safety of Household and Similar Electrical Appliances — Part 1: General Requirements",
            scope="This standard covers the general safety requirements, test guidelines, and specifications for household electronic appliances.",
            category="Household Electrical & Consumer Electronics",
            qco_details="Electrical Appliances QCO, 2023.",
            scheme="Scheme I (ISI Mark)",
            is_mandatory=True,
            match_score=85,
            why_matched=["Parent safety standard for all household appliances"],
            why_not_applied=None,
            applicable=["All Household Electrical Appliances"],
            amendments=1
        )

        # Cable Standard IS 694
        is694 = add_standard(
            code="IS 694",
            title="Polyvinyl Chloride (PVC) Insulated Cables for Working Voltages up to and including 1100 V",
            full_title="PVC Insulated Cables for Working Voltages up to and including 1100 V",
            scope="Covers specifications for PVC insulated cables used for transmission and distribution wiring.",
            category="Cables, Wires and Accessories",
            qco_details="Cables QCO, 2023.",
            scheme="Scheme I (ISI Mark)",
            is_mandatory=True,
            match_score=75,
            why_matched=["Required standard for flexible supply cables and power cords"],
            why_not_applied=None,
            applicable=["Flexible Supply Cords", "Industrial Cables"],
            amendments=3
        )

        # Plug Standard IS 1293
        is1293 = add_standard(
            code="IS 1293",
            title="Plugs and Socket-Outlets of Rated Voltage up to and including 250 V and Rated Current up to and including 16 A",
            full_title="Plugs and Socket-Outlets of Rated Voltage up to 250 V and Current up to 16 A",
            scope="Covers plugs and socket-outlets for household and general domestic purposes.",
            category="Electrical Wiring Accessories",
            qco_details="Plugs and Sockets QCO, 2020.",
            scheme="Scheme I (ISI Mark)",
            is_mandatory=True,
            match_score=70,
            why_matched=["Required standard for fitted supply plug accessories"],
            why_not_applied=None,
            applicable=["3-pin Plugs", "Socket outlets"],
            amendments=1
        )

        # Exclusion Standard IS 9849
        is9849 = add_standard(
            code="IS 9849",
            title="Commercial Food Preparation Machines - Safety Requirements",
            full_title="Commercial Food Preparation Machines - Safety Requirements",
            scope="Deals with commercial kitchen machines intended for continuous hotel or restaurant catering.",
            category="Industrial Machinery",
            qco_details=None,
            scheme="Voluntary System",
            is_mandatory=False,
            match_score=40,
            why_matched=["Exclusion reference standard"],
            why_not_applied="Applies only to high-power industrial continuous-rating commercial machines.",
            applicable=["Commercial Mixer Grinders", "Industrial Vegetable Cutters"],
            amendments=0,
            status="SUPERSEDED"
        )

        # Seed Clauses for IS 302-2-14
        print("Seeding IS 302-2-14 clauses...")
        clauses_data = [
            {
                "clause_number": "Clause 1.1",
                "title": "Scope and Object",
                "text": "This standard deals with the safety of electric kitchen machines for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances. Appliances not intended for normal household use but which nevertheless may be a source of danger to the public, such as appliances intended to be used by laymen in shops, in light industry and on farms, are within the scope of this standard.",
                "highlighted_text": "This standard deals with the safety of electric kitchen machines for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances.",
                "used_to_support": "Directly establishes applicability for domestic 230V 750W mixer grinders and kitchen machines."
            },
            {
                "clause_number": "Clause 7.1",
                "title": "Marking and Instructions",
                "text": "Appliances shall be marked with rated voltage or rated voltage range in volts (V), symbol for nature of supply unless rated frequency is marked, rated power input in watts (W) or rated current in amperes (A), name or trade mark or identification mark of the manufacturer or responsible vendor, and model or type reference. The Standard Mark (ISI mark) shall be affixed in accordance with the BIS Licence provisions.",
                "highlighted_text": "Appliances shall be marked with rated voltage or rated voltage range in volts (V), symbol for nature of supply, rated power input in watts (W), and model or type reference.",
                "used_to_support": "Marking verification requirement. Critical check in factory sample inspection."
            },
            {
                "clause_number": "Clause 8.1",
                "title": "Protection Against Access to Live Parts",
                "text": "Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts. Test probe B of IS 1401 is applied with a force not exceeding 20 N; the probe shall not enter openings leading to uninsulated live conductors or internal motor windings.",
                "highlighted_text": "Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts. Test probe B shall not enter openings.",
                "used_to_support": "Safety enclosure ingress requirement for motor housing ventilation slots."
            },
            {
                "clause_number": "Clause 13.2",
                "title": "Leakage Current and Electric Strength at Operating Temperature",
                "text": "The leakage current of the appliance shall not be excessive and its electric strength shall be adequate. For Class I appliances, the leakage current measured between any pole of supply and accessible metal parts shall not exceed 0.75 mA or 0.75 mA per kW rated input, whichever is higher.",
                "highlighted_text": "For Class I appliances, the leakage current measured between any pole of supply and accessible metal parts shall not exceed 0.75 mA.",
                "used_to_support": "Mandatory routine and type laboratory safety test."
            },
            {
                "clause_number": "Clause 19.11",
                "title": "Abnormal Operation & Motor Lock Test",
                "text": "Motor-operated appliances shall be tested under locked-rotor conditions for a duration of 30 seconds or until the thermal overload protector operates. The temperature of the windings shall not exceed the values specified in Table 8, and no fire or molten insulation hazard shall occur.",
                "highlighted_text": "tested under locked-rotor conditions for a duration of 30 seconds or until the thermal overload protector operates.",
                "used_to_support": "Mandatory thermal trip device testing on mixer grinders.",
                "amendment_note": "Amended in 2022 to mandate auto-resetting or manual-reset overload protector cycling verification."
            },
            {
                "clause_number": "Clause 20.2",
                "title": "Stability and Mechanical Hazards",
                "text": "Moving parts of kitchen machines, such as rotating cutter blades and beaters, shall be arranged or enclosed so as to provide adequate protection against personal injury. Blades shall be securely anchored to withstand 1.2 times maximum rated speed with jar loaded with viscous test medium.",
                "highlighted_text": "Moving parts of kitchen machines, such as rotating cutter blades, shall provide adequate protection against personal injury.",
                "used_to_support": "Mechanical safety of stainless steel jar blade assembly."
            }
        ]

        for c_data in clauses_data:
            existing = db.query(StandardClause).filter(
                StandardClause.standard_id == is302_2_14.id,
                StandardClause.clause_number == c_data["clause_number"]
            ).first()
            if not existing:
                clause = StandardClause(
                    id=str(uuid.uuid4()),
                    standard_id=is302_2_14.id,
                    clause_number=c_data["clause_number"],
                    title=c_data["title"],
                    clause_text=c_data["text"],
                    highlighted_text=c_data["highlighted_text"],
                    used_to_support=c_data["used_to_support"],
                    amendment_note=c_data.get("amendment_note")
                )
                db.add(clause)

        db.commit()

        # Seed timelines
        print("Seeding timelines...")
        timeline_data = [
            {"standard": is302_2_14, "year": "2009", "event": "First revision published aligned with IEC 60335-2-14", "status": "past"},
            {"standard": is302_2_14, "year": "2018", "event": "Reaffirmed with mandatory earth continuity stipulations", "status": "past"},
            {"standard": is302_2_14, "year": "2022", "event": "Amendment 1: Added thermal overload protector endurance test protocols", "status": "past"},
            {"standard": is302_2_14, "year": "2024", "event": "Amendment 2: Mandated dual-stage interlock on food processor lid mechanisms", "status": "current"},
            {"standard": is302_2_14, "year": "2026", "event": "Harmonized compliance enforcement under revised QCO mandate", "status": "future"}
        ]

        for t_data in timeline_data:
            existing = db.query(StandardTimeline).filter(
                StandardTimeline.standard_id == t_data["standard"].id,
                StandardTimeline.year == t_data["year"]
            ).first()
            if not existing:
                tl = StandardTimeline(
                    id=str(uuid.uuid4()),
                    standard_id=t_data["standard"].id,
                    year=t_data["year"],
                    event=t_data["event"],
                    timeline_status=t_data["status"]
                )
                db.add(tl)

        db.commit()

        # Seed standard relationships
        print("Seeding relationships...")
        relationships_data = [
            {"src": is302_2_14, "tgt": is302_1, "type": RelationshipType.PARENT, "desc": "Derived from general requirements safety standard Part 1"},
            {"src": is302_2_14, "tgt": is694, "type": RelationshipType.REFERENCES, "desc": "References PVC cables and supply cord requirements"},
            {"src": is302_2_14, "tgt": is1293, "type": RelationshipType.REFERENCES, "desc": "References domestic plugs and sockets requirements"},
            {"src": is302_2_14, "tgt": is9849, "type": RelationshipType.SUPERSEDES, "desc": "Distinguishes domestic vs industrial safety bounds"}
        ]

        for r_data in relationships_data:
            existing = db.query(StandardRelationship).filter(
                StandardRelationship.source_standard_id == r_data["src"].id,
                StandardRelationship.target_standard_id == r_data["tgt"].id
            ).first()
            if not existing:
                rel = StandardRelationship(
                    id=str(uuid.uuid4()),
                    source_standard_id=r_data["src"].id,
                    target_standard_id=r_data["tgt"].id,
                    relationship_type=r_data["type"],
                    description=r_data["desc"]
                )
                db.add(rel)

        db.commit()

        # Seed Standard Amendments
        print("Seeding amendments...")
        amendment_data = [
            {"standard": is302_2_14, "num": "1", "title": "Thermal protection endurance criteria", "year": 2022, "eff": "2023-01-01"},
            {"standard": is302_2_14, "num": "2", "title": "Dual-stage interlock mandate for processors", "year": 2024, "eff": "2024-07-01"}
        ]

        for a_data in amendment_data:
            existing = db.query(StandardAmendment).filter(
                StandardAmendment.standard_id == a_data["standard"].id,
                StandardAmendment.amendment_number == a_data["num"]
            ).first()
            if not existing:
                amd = StandardAmendment(
                    id=str(uuid.uuid4()),
                    standard_id=a_data["standard"].id,
                    amendment_number=a_data["num"],
                    title=a_data["title"],
                    publication_year=a_data["year"],
                    effective_date=a_data["eff"],
                    status="ACTIVE"
                )
                db.add(amd)

        db.commit()

        # 3. Seeding Laboratories
        print("Seeding laboratories...")
        labs_data = [
            {
                "name": "Central Power Research Institute (CPRI)",
                "city": "Bengaluru",
                "state": "Karnataka",
                "address": "Prof. Sir C.V. Raman Road, Sadashivanagar, Bengaluru - 560080",
                "recognized": ["Safety testing of household electronic kitchen machines", "Safety testing of domestic plugs and cables"],
                "standards": ["IS 302-2-14", "IS 302-1", "IS 1293", "IS 694"],
                "turnaround": "12 Days",
                "contact": "+91 (80) 2360 2329 | cpriblr@cpri.res.in",
                "type": "National Testing Laboratory"
            },
            {
                "name": "BIS Central Laboratory (Ghaziabad)",
                "city": "Ghaziabad",
                "state": "Uttar Pradesh",
                "address": "Plot No. 20/9, Site IV, Sahibabad Industrial Area, Ghaziabad - 201010",
                "recognized": ["ISI Mark conformity testing", "Quality audits and compliance verification"],
                "standards": ["IS 302-2-14", "IS 302-1", "IS 694"],
                "turnaround": "14 Days",
                "contact": "+91 (120) 286 9801 | cl@bis.gov.in",
                "type": "BIS Institutional Laboratory"
            },
            {
                "name": "TUV Rheinland India (Chennai Lab)",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "address": "Plot No. 42, Outer Ring Road, Ambattur Industrial Estate, Chennai - 600058",
                "recognized": ["Ingress safety probe testing (Clause 8)", "Leakage safety testing (Clause 13)"],
                "standards": ["IS 302-2-14", "IS 302-1"],
                "turnaround": "10 Days",
                "contact": "+91 (44) 4208 0900 | contact@in.tuv.com",
                "type": "BIS-Recognized Private Laboratory"
            }
        ]

        for l_data in labs_data:
            existing = db.query(Laboratory).filter(Laboratory.name == l_data["name"]).first()
            if not existing:
                lab = Laboratory(
                    id=str(uuid.uuid4()),
                    name=l_data["name"],
                    city=l_data["city"],
                    state=l_data["state"],
                    address=l_data["address"],
                    recognized_for=l_data["recognized"],
                    supported_standards=l_data["standards"],
                    turnaround_days=l_data["turnaround"],
                    contact=l_data["contact"],
                    sample_type=l_data["type"],
                    is_demo=True
                )
                db.add(lab)

        db.commit()

        # 4. Seeding Licences
        print("Seeding Licences...")
        licences_data = [
            {
                "cml": "CM/L-8472910",
                "manufacturer": "SIH MSME Appliances Ltd",
                "product": "Domestic Electric Food Mixers, Grinders & Juicers",
                "standard": "IS 302-2-14",
                "factory": "Plot 24, MSME Hub, Coimbatore, Tamil Nadu, 641001",
                "scope": "Electrical kitchen machines up to 1000W rated power input",
                "from_date": "2024-01-01",
                "to_date": "2028-12-31",
                "status": "ACTIVE"
            },
            {
                "cml": "CM/L-1234567",
                "manufacturer": "Counterfeit Appliances India Pvt Ltd",
                "product": "Imitation Domestic Blender Grinders",
                "standard": "IS 302-2-14",
                "factory": "Unknown Warehouse Location",
                "scope": "Electrical appliances",
                "from_date": "2020-01-01",
                "to_date": "2022-01-01",
                "status": "CANCELLED"
            }
        ]

        for lic_data in licences_data:
            existing = db.query(Licence).filter(Licence.licence_number == lic_data["cml"]).first()
            if not existing:
                lic = Licence(
                    id=str(uuid.uuid4()),
                    licence_number=lic_data["cml"],
                    manufacturer=lic_data["manufacturer"],
                    product=lic_data["product"],
                    standard_code=lic_data["standard"],
                    factory=lic_data["factory"],
                    scope=lic_data["scope"],
                    valid_from=lic_data["from_date"],
                    valid_until=lic_data["to_date"],
                    status=lic_data["status"],
                    is_demo=True
                )
                db.add(lic)

        db.commit()
        print("Database seeded successfully! All parameters matching UI mock states are ready.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
