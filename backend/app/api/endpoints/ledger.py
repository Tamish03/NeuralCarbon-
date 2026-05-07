from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import hashlib
import json
import uuid

router = APIRouter()

class LedgerTimestampRequest(BaseModel):
    emissionsReducedKg: float
    carbonCreditsEarned: float

class LedgerTimestampResponse(BaseModel):
    status: str
    transaction_hash: str
    block_number: int
    timestamp: str
    data_hash: str
    network: str

@router.post("/timestamp", response_model=LedgerTimestampResponse)
def timestamp_ledger(req: LedgerTimestampRequest):
    """
    Cryptographically timestamps ESG data by hashing the payload and
    simulating an on-chain anchor. In production, this would call
    an Ethereum/Polygon RPC via Web3.py using WEB3_PROVIDER_URL and
    a funded wallet private key.
    """
    # Build the canonical data payload
    payload = {
        "emissions_reduced_kg": req.emissionsReducedKg,
        "carbon_credits_earned": req.carbonCreditsEarned,
        "anchored_at": datetime.utcnow().isoformat(),
        "nonce": str(uuid.uuid4())
    }
    
    # SHA-256 hash of the canonical JSON
    canonical = json.dumps(payload, sort_keys=True).encode("utf-8")
    data_hash = hashlib.sha256(canonical).hexdigest()
    
    # Simulate a transaction hash (in production: web3.eth.send_raw_transaction)
    tx_seed = f"{data_hash}:{datetime.utcnow().timestamp()}"
    tx_hash = "0x" + hashlib.sha256(tx_seed.encode()).hexdigest()
    
    # Simulate a block number
    import random
    block_number = random.randint(19_000_000, 20_000_000)
    
    return LedgerTimestampResponse(
        status="anchored",
        transaction_hash=tx_hash,
        block_number=block_number,
        timestamp=datetime.utcnow().isoformat() + "Z",
        data_hash="0x" + data_hash,
        network="Polygon Mumbai (Simulated)"
    )
