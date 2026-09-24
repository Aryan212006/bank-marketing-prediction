from pydantic import BaseModel, Field
from typing import Literal

class CustomerData(BaseModel):
    # 1. Bank Client Attributes
    age: int = Field(..., ge=18, le=100, description="Customer age (18 to 100)")
    job: Literal[
        'admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management',
        'retired', 'self-employed', 'services', 'student', 'technician',
        'unemployed', 'unknown'
    ] = Field(..., description="Type of job")
    marital: Literal['divorced', 'married', 'single'] = Field(..., description="Marital status")
    education: Literal['primary', 'secondary', 'tertiary', 'unknown'] = Field(..., description="Education level")
    default: Literal['yes', 'no'] = Field(..., description="Credit in default?")
    balance: float = Field(..., description="Average yearly balance in euros")
    housing: Literal['yes', 'no'] = Field(..., description="Has housing loan?")
    loan: Literal['yes', 'no'] = Field(..., description="Has personal loan?")

    # 2. Campaign Last Contact Attributes
    contact: Literal['cellular', 'telephone', 'unknown'] = Field(..., description="Contact communication type")
    day: int = Field(..., ge=1, le=31, description="Last contact day of the month (1-31)")
    month: Literal[
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ] = Field(..., description="Last contact month of the year")
    duration: int = Field(..., ge=0, description="Last contact duration in seconds")

    # 3. Campaign History Attributes
    campaign: int = Field(..., ge=1, description="Number of contacts during this campaign")
    pdays: int = Field(..., ge=-1, description="Days passed since previous campaign contact (-1 = not contacted)")
    previous: int = Field(..., ge=0, description="Number of contacts performed before this campaign")
    poutcome: Literal['failure', 'other', 'success', 'unknown'] = Field(..., description="Outcome of previous marketing campaign")

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 35,
                "job": "management",
                "marital": "married",
                "education": "tertiary",
                "default": "no",
                "balance": 2500.0,
                "housing": "yes",
                "loan": "no",
                "contact": "cellular",
                "day": 15,
                "month": "may",
                "duration": 450,
                "campaign": 1,
                "pdays": -1,
                "previous": 0,
                "poutcome": "unknown"
            }
        }
    }

class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="Binary prediction: 1 = Yes (Subscribe), 0 = No")
    prediction_label: str = Field(..., description="Human-readable decision: 'Yes' or 'No'")
    subscription_probability: float = Field(..., description="Probability of subscribing (0.0 to 1.0)")
    confidence_score: float = Field(..., description="Percentage confidence (0.0 to 100.0%)")
    recommendation: str = Field(..., description="Actionable business recommendation for marketers")
