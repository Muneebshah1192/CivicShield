from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.schemas import SimulationScenarioRequest
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/simulation", tags=["FYP Simulation Center"])

@router.post("/trigger")
async def trigger_simulation_scenario(req: SimulationScenarioRequest, db: Session = Depends(get_db)):
    result = await simulation_service.trigger_simulation(db, req.scenario_type)
    return result
