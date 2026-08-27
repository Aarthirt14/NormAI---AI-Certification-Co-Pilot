from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_bis_services():
    """Retrieve BIS services catalogue directory."""
    return [
        {
            "id": "prod_cert",
            "title": "Product Certification (ISI Mark)",
            "description": "Scheme I & II licensing for manufacturers. Covers testing, factory audit, and conformity authorization.",
            "link": "https://www.bis.gov.in/index.php/product-certification/"
        },
        {
            "id": "hallmark",
            "title": "Hallmarking Scheme",
            "description": "Mandatory purity certification for gold and silver jewellery using unique HUID markings.",
            "link": "https://www.bis.gov.in/index.php/hallmarking-overview/"
        },
        {
            "id": "lab_services",
            "title": "Laboratory Services",
            "description": "Central laboratory network and recognized private testing houses for sample verification.",
            "link": "https://www.bis.gov.in/index.php/laboratory-network/"
        },
        {
            "id": "mgmt_systems",
            "title": "Management Systems Certification",
            "description": "ISO 9001, ISO 14001, and ISO 45001 auditing and registration service for organizations.",
            "link": "https://www.bis.gov.in/index.php/system-certification/"
        },
        {
            "id": "training_nits",
            "title": "National Institute of Training (NITS)",
            "description": "Training programs for standards formulation, quality control, laboratory testing, and auditing.",
            "link": "https://www.bis.gov.in/index.php/nits-training/"
        },
        {
            "id": "consumer_services",
            "title": "Consumer Engagement Portal",
            "description": "Verify licensee status, report misuse of ISI/CRS marks, and submit safety complaints.",
            "link": "https://www.bis.gov.in/index.php/consumer-portal/"
        }
    ]
